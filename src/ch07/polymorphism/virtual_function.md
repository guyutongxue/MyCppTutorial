# 虚函数

按照上一节引入的子类型多态，首先来尝试一个现实的例子：
```CPP
#include <string>
#include <iostream>
struct Animal {
    std::string getName() const {
        return "animal";
    }
};
struct Cat : public Animal {
    std::string getName() const {
        return "cat";
    };
};
struct Dog : public Animal {
    std::string getName() const {
        return "dog";
    };
};

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
    std::cout << "Here is your new " << pet->getName() << std::endl;
    delete pet;
}
```

上面这段代码试图实现这样的功能：根据用户的输入决定指针 `pet` 指向的类型：如果输入为 `1` 则指向一个新的 `Cat` 对象，否则指向一个新的 `Dog` 对象，然后把它的名字输出。看上去挺像那么回事儿，但它并不工作。你会发现，不管你输入什么，输出的总是
```io
Here is your new animal
```
而不是 `cat` 或者 `dog`。奇怪，在 `Cat` 类的 `getName` 成员函数的返回值不是 `"cat"` 么？讲道理，如果输入为 `1`，当执行 `new Cat` 之后，`pet` 指向的这个对象的 `getName()` 调用应该得到 `"cat"` 呀。

问题出现在之前提到的继承中成员名的处理方式上了。当派生类中出现一个和基类名字相同的成员时，并不会覆盖基类的成员实现，而是在保留基类成员的同时增加一个同名派生类成员。也就是说，`new Cat` 中包含两份 `getName`，其中一个是 `Animal::getName`，返回 `"animal"`；另一个是 `Cat::getName`，返回 `"cat"`。

那么现在执行 `pet->getName()`，或者说 `(*pet).getName()` 时，找到的是 `Animal::getName` 还是 `Cat::getName` 呢？前面说过，这里省略的作用域是左侧操作数的类型。也就是说，这个 `getName` 是哪个取决于 `(*pet)` 的类型—— `pet` 是 `Animal*` 类型的，那么 `(*pet)` 自然就是 `Animal` 类型的，那么 `(*pet).getName` 就相当于 `(*pet).Animal::getName`！所以，不论是猫是狗，最终执行的总是 `Animal::getName`，不会是我们想要的 `Cat::getName` 或 `Dog::getName`。

于是怎么办呢？C++ 提供了虚函数机制，它可用于重写（或者说覆盖）基类的成员函数。

对于我们这个例子，它的实现很简单：在 `Animal::getName` 前面加上 `virtual` 关键字修饰即可：
```cpp
struct Animal {
    virtual std::string getName() const {
        return "animal";
    }
};
```
然后再跑一遍程序，一切输出就都正常了。像这样被 `virtual` 修饰的成员函数就是虚函数了，它是实现子类型多态的一个重要组成部分。

## 什么是虚函数

虚函数（Virtual function）是一种特殊的成员函数。形象地讲，其特殊性在于它可以**被派生类的同名成员函数覆盖**。比如对于 `Base` 类的虚函数 `Base::f`，如果它拥有一个子类 `Derived`，且子类也定义了同名的函数 `Derived::f`， 则在某些时刻下，本应调用 `Base::f` 的场合实际却调用了 `Derived::f`：或者说 `Base::f` 的调用被 `Derived::f` 所覆盖。

那么上文中的“某些时刻”是什么时刻呢？唯有以下两种情形会发生：
1. `Base*` 类型的指针，却指向一个 `Derived` 类型的对象；
2. `Base&` 类型的引用，却绑定到一个 `Derived` 类型的对象。

这时，如果对这样的指针做成员函数调用一个虚函数：
```cpp
Derived d;
Base* pb{&d};
Base& rb{d};
pb->f(); // 通过 Base* 调用虚函数
rb.f();  // 通过 Base& 调用虚函数
```

那么，此时实际被调用的是 `Derived::f()`。反之，如果 `f` 不是虚的，那么调用的就是 `Base::f()`。

显然，典型的虚函数的写法是在成员函数前加以 `virtual` 关键字限定：
```sdsc-legacy
virtual **返回值类型** *成员函数名*(**参数列表**) *函数体*
```

## 注意事项

在成员函数中也可调用虚函数。
```CPP
#include <iostream>
struct Base {
    void callF() {
        f(); // 相当于 this->f();
    }
    virtual void f() { // 虚函数，可被子类覆盖
        std::cout << "Base called" << std::endl;
    }
};
struct Derived : Base {
    void f() {
        std::cout << "Derived called" << std::endl;
    }
};
int main() {
    Base* b{new Derived{}};
    b->callF(); // 输出 Derived called
}
```

这是因为成员函数中的成员使用相当于隐含了前缀 `this->`，而在这里的 `this->f()` 和刚刚的情形是一致的，会调用虚函数的实际覆盖函数而非 `this` 本身的类型。所以，`callF` 在刚才的例子中调用了 `Derived::f` 而非 `Base::f`。但是，构造函数和析构函数中无法调用到派生类的虚函数覆盖：因为在运行构造函数和析构函数的时期派生类尚未形成或已经消失。

此外，虚函数拥有这样的特点：任何用于覆盖虚函数的子类同名函数，也是虚函数。即：
```CPP
struct A {
    virtual void f() { }
};
struct B : A {
    void f() { } // 尽管没有 virtual 关键字修饰，但它仍然是虚函数
};
struct C : B {
    void f() { } // C::f 可能覆盖 B::f，因为后者是虚的
};
int main() {
    B* b;
    b = new C{};
    b->f(); // 调用 C::f 而非 B::f
    delete b;
}
```
在上面的例子中，我们已经知道了可能会发生 `B::f` 覆盖 `A::f` —— 因为 `A::f` 是虚函数。但正如刚刚所讲，`B::f` 因为和 `A::f` 同名，所以 `B::f` 也是虚函数（尽管它没有显式地用 `virtual` 修饰）。所以 `main` 函数中的操作会调用 `C::f` 而非 `B::f`。

> 虚函数的实现？虚函数表？虚指针？自己找国内那些教材看去。
