# 抽象类

在面向对象编程中，有时将类在功能上分为两种，一种叫“具体类”，另一种叫“抽象类”。所谓“具体类”是指在程序运行当中会使用这种类的若干个实例，即在某个地方、某些时刻会创建这些类型的对象。反之，“抽象类”就是不会创建任何一个实例的类。为了演示这种分类，我们将之前的例子完善一下：

```CPP
#include <iostream>
struct Animal {
    virtual ~Animal() { } // 令 Animal 为多态类型
};
struct Cat : public Animal {
    void meow() const {
        std::cout << "meow~" << std::endl;
    }
};
struct Dog : public Animal {
    void bark() const {
        std::cout << "woof!" << std::endl;
    }
};

void tryBark(const Animal* a) {
    if (typeid(*a) == typeid(Dog)) {
        const Dog* dog{static_cast<const Dog*>(a)};
        dog->bark();
    }
}

int main() {
    Animal* pet{nullptr};
    std::cout << "If you want a cat, press 1." << std::endl;
    int n;
    std::cin >> n;
    if (n == 1) {
        pet = new Cat{};
    } else {
        pet = new Dog{};
    }
    tryBark(pet);
    delete pet;
}
```

我删去了不必要的 `getName`，并令 `Animal` 的析构函数为虚使得其为多态类型，从而 `tryBark` 能够正常运行。这个程序中，如果你输入 `1`，则 `tryBark` 不做任何事；否则输出 `woof!`。

上面的程序创建了三个类 `Animal` `Cat` 和 `Dog`，但在实际使用中我们只可能创建 `Cat` 和 `Dog` 类的对象，而不可能仅创建一个 `Animal` 类型的对象。因此，按照上面的划分，`Cat` 和 `Dog` 是“具体类”，相对地 `Animal` 就是“抽象类”。

C++ 提供了在语法层面的**抽象类**（Abstract class）。所谓“语法层面”就是指，如果尝试创建一个抽象类的实例，C++ 就会给出编译错误。这种语法设计可以减少编码时的错误，并有助于程序结构清晰。那么如何创建语法层面的抽象类呢？首先需要引入一个新概念——纯虚函数。

## 纯虚函数

**纯虚函数**（Pure virtual function）是一种带有特殊标记的虚函数。所谓特殊标记就是：
```sdsc
virtual **返回值类型** *函数名*(**参数列表**) = 0;
```

它与普通的虚函数多了一个被称为*纯说明符*的小尾巴 `= 0`。换句话说，只要给一个虚函数加上这个 `= 0` 就使得它变成了纯虚函数。不过由于语法限制，*纯说明符*和函数体无法同时出现，故**纯虚函数不允许类内定义**。

而语法层面的抽象类就是指**含有或继承了纯虚函数的类**。因此，如果一个类带有纯虚函数，那么它成为抽象类，从而不能定义该类的任何对象。

下面我们将上文例子中的 `Animal` 定义为抽象类。我只需要将添加一个纯虚函数 `act` 即可。

```CPP
#include <iostream>
struct Animal {
    virtual void act() const = 0; // 纯虚函数，使得 Animal 为抽象类
};

struct Cat : public Animal {
    void act() const { // 必须定义 Cat::act 来覆盖纯虚函数（见下文）
        std::cout << "It says: ";
        meow();
    }
    void meow() const {
        std::cout << "meow~" << std::endl;
    }
};

struct Dog : public Animal {
    void act() const { // 必须定义
        std::cout << "It says: ";
        bark();
    }
    void bark() const {
        std::cout << "woof!" << std::endl;
    }
};

int main() {
    // Animal a;                // 编译错误
    // Animal* p{new Animal{}}; // 编译错误
    Animal* pet{new Cat{}};     // OK

    // [...]
    // 调用虚函数的最终覆盖
    pet->act();
    delete pet;
}
```

我在 `Animal` 中添加了纯虚函数声明 `Animal::act`。这时，`Animal` 类成为抽象类，这个类的对象就不可能被构造出来。但由于继承的存在，`Animal::act` 会被继承到 `Cat` 和 `Dog` 中去，而根据抽象类的概念，`Cat` 和 `Dog` 就都变成抽象类了。这不好。所以每个具体的派生类都需要重写一个非虚的 `act` 成员来保证自己不是抽象的。

这也就是抽象类和纯虚函数的实际用途的体现。一般地，抽象类经常作为一个一般性概念而存在；它会包含若干个具体的派生类作为这个一般性感念的具体解释。而抽象类的纯虚函数则作为一个约束，要求其派生类必须实现这些函数的定义。

纯虚函数不能有类内定义，不过如果一个纯虚函数始终不会被调用，那么就无需给出它的定义。在刚才的例子中就从来没有调用过 `Animal::act`，故不用给出定义。但这不意味着纯虚函数不能有定义。纯虚函数可以在类外定义：下面给出了定义并调用 `Animal::act` 的版本：
```CPP
#include <iostream>
struct Animal {
    virtual void act() const = 0; // 纯虚函数，不能类内定义，但……
};

// ……可以类外定义
void Animal::act() {
    std::cout << "It says: ";
}

struct Cat : public Animal {
    void act() const { // 覆盖纯虚函数
        Animal::act(); // 调用基类的纯虚函数
        meow();
    }
    void meow() const {
        std::cout << "meow~" << std::endl;
    }
};

struct Dog : public Animal {
    void act() const { // 覆盖纯虚函数
        Animal::act();
        bark();
    }
    void bark() const {
        std::cout << "woof!" << std::endl;
    }
};

int main() {
    Animal* pet{nullptr};
    pet = new Cat{};

    // [...]
    // 调用虚函数的最终覆盖
    pet->act(); 
    delete pet;
}
```
