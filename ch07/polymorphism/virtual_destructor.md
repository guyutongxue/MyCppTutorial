# 虚析构函数（未完成）

本节介绍一些需要将析构函数设置为虚函数的情形。

> 构造函数不可能是虚的。之所以会用到虚函数以及多态，是因为某些对象的运行时类型在编译期间不清楚，调用虚函数使得程序在运行期间才能确定使用哪段程序。但构造何种类型的对象在编译期间是总能确定的（即 `new T{}` 中的 `T` 是编译期间得知的），故调用哪种类型的构造函数是不需要虚函数机制，也不可能出现运行时多态。反之，析构函数可能是虚的，因为在释放对象时，这个对象的类型可能是运行期才能知道的（即 `delete p` 中的 `p` 指向的是一个动态类型），所以执行析构函数是可以存在多态性的。

## 形成多态类型

之前第一次出现虚析构函数就是希望让某个类是多态类型，从而可以应用 RTTI 于其上。当没有其余合适的成为虚函数的成员时，可以选择将析构函数设置为虚的。

```CPP
#include <iostream>
#include <typeinfo>
struct Base {
    virtual ~Base() { }
};
struct Derived : Base { };
int main() {
    Base* p{new Derived{}};
    dynamic_cast<Derived*>(p); // 若删去虚析构函数，则 dynamic_cast 导致编译错误
    std::cout << (typeid(*p) == typeid(Derived)) << std::endl;
}
```

## 形成抽象类

此外，如果希望某各类成为抽象类，但没有其余合适的成为纯虚函数的成员时，可以选择将析构函数设置为纯虚的。

```CPP
#include <iostream>
struct Animal {
    virtual ~Animal() = 0; // 令 Animal 为抽象类
};

// 必须给出定义，原因见下
Animal::~Animal() { }

struct Cat : public Animal {
    void meow() const {
        std::cout << "meow~" << std::endl;
    }
};

int main() {
    // Animal a;                // 编译错误
    // Animal* p{new Animal{}}; // 编译错误
    Animal* q{new Cat{}};       // OK

    // [...]
    delete q;
}
```

但请务必注意，在上面的代码中，我们**必须定义** `Animal::~Animal`。因为在释放 `Cat` 类型对象时，程序[会去调用](ch07/inheritance/misc#重申隐式函数)基类 `Animal` 的析构函数；若只声明却不定义 `Animal::~Animal` 会得到链接错误。

## 资源安全性

?> [TODO]