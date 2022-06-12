# 虚析构函数

本节介绍一些需要将析构函数设置为虚函数的情形。

> 构造函数不可能是虚的。之所以会用到虚函数以及多态，是因为某些对象的运行时类型在编译期间不清楚，调用虚函数使得程序在运行期间才能确定使用哪段程序。但构造何种类型的对象在编译期间是总能确定的（即 `new T{}` 中的 `T` 是编译期间得知的），故调用哪种类型的构造函数是不需要虚函数机制，也不可能出现运行时多态。反之，析构函数可能是虚的，因为在释放对象时，这个对象的类型可能是运行期才能知道的（即 `delete p` 中的 `p` 指向的是一个动态类型），所以执行析构函数是可以存在多态性的。

## 形成多态类型

之前第一次出现虚析构函数就是希望让某个类是多态类型，从而可以应用 RTTI 于其上。当没有其余合适的成为虚函数的成员时，可以选择将析构函数设置为虚的。

````cpp codemo(show)
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

````cpp codemo(show)
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

但请务必注意，在上面的代码中，我们**必须定义** `Animal::~Animal`。因为在释放 `Cat` 类型对象时，程序[会去调用](/ch07/inheritance/misc#再谈预置函数)基类 `Animal` 的析构函数；若只声明却不定义 `Animal::~Animal` 会得到链接错误。

## 资源安全性

考虑以下代码：
````cpp codemo(show)
#include <iostream>
struct Base { };
struct Derived : Base {
private:
    char* p;

public:
    Derived(unsigned size) {
        p = new char[size];
        std::cout << "ctor called" << std::endl;
    }
    ~Derived() {
        delete[] p;
        std::cout << "dtor called" << std::endl;
    }
};

int main() {
    Base* b{nullptr};
    b = new Derived(16);
    // [...]
    delete b;
}
```

这段代码中，`Derived` 继承了 `Base`，并拥有一个指针 `p` 可以指向一片 `new` 出来的内存。`p` 所指向的内存会在 `Derived` 构造时申请得到，在 `Derived` 析构时释放。然后，main 函数中用多态的风格使用了 `Derived`。一切看上去都很不错，但这段程序只会输出：
```io
ctor called
```
也就是说，`~Derived` 的析构函数根本没被执行。这是为什么呢？

问题的根源在 `delete b` 这个表达式的执行上。执行 `delete` 会调用操作数所指向对象的析构函数，即 `delete b` 在释放其内存前掉用 `b->~Base()`。这里调用 `~Base` 而非 `~Derived` 的原因正是 `b` 是 `Base*` 类型而非 `Derived*` 类型的。因此，整个析构过程中，`~Derived` 根本无法得到调用。造成的后果就是 `Derived::p` 所指向的内存没被释放，一个内存泄漏出现了。

这很不好。那有什么解决办法呢？注意到这里的情形和之前引入虚函数的例子很像——期望调用派生类函数的场景却调用了基类的函数。所以方法就是：将析构函数设置为虚函数。

````cpp codemo(show)
#include <iostream>
struct Base {
    // 写空函数体也行，和 =default 效果一样
    virtual ~Base() = default;
};
struct Derived : Base {
private:
    char* p;

public:
    Derived(unsigned size) {
        p = new char[size];
        std::cout << "ctor called" << std::endl;
    }
    ~Derived() {
        delete[] p;
        std::cout << "dtor called" << std::endl;
    }
};

int main() {
    Base* b{nullptr};
    b = new Derived(16);
    // [...]
    delete b;
}
```

这段代码就能正确输出 `dtor called` 了，证明虚析构能够解决刚才所说的内存泄漏问题。具体讲，若 `b` 所指向对象的析构函数是虚的，`delete b` 会转而调用析构函数的最终覆盖函数——即 `Derived::~Derived` 这个虚函数；随后，析构过程会继续析构其基类和各成员。这就解释了为什么在许多场合虚析构函数是必须存在的。
