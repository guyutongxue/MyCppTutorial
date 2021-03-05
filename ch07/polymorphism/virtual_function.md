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
然后再跑一遍程序，一切输出就都正常了。

