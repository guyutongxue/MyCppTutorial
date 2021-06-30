# RTTI（未完成）

## 引入

考虑之前的代码：
```cpp
#include <string>
#include <iostream>
struct Animal {
    virtual std::string getName() const {
        return "animal";
    }
};
struct Cat : public Animal {
    std::string getName() const {
        return "cat";
    }
    void meow() const { }
};
struct Dog : public Animal {
    std::string getName() const {
        return "dog";
    }
    void bark() const { }
};
```

我在其中添加了两个成员函数：`Dog` 拥有自己独有的成员函数 `bark`，而 `Cat` 拥有自己独有的成员函数 `meow`。那么，如果我们想要编写这样一个功能：检查一个 `Animal` 是不是 `Dog`，如果是的话就让它 `bark()`，否则什么都不做。那么怎么去实现呢？

最基础的想法是利用之前的 `getName`。
```cpp
void tryBark(const Animal* a) {
    if (a->getName() == "dog") {
        const Dog* dog{(const Dog*)a};
        dog->bark();
    }
}
```

但是这带来一个问题：就是它依赖于这样一个不那么可靠的自定义函数 `getName`。为什么说“不那么可靠”呢？我们必须为每一个 `Animal` 的子类定义一个 `getName` 虚函数的覆盖，并且不同子类的返回值必须不同。（即只有 `Dog` 的 `getName` 会返回 `"dog"`。）那么这个维护成本就很高了。

> 除此之外，还有函数调用的时间和空间开销也是有可能存在的（但一般会被优化）。可以通过将 `getName` 定义为数据成员（只读，并在初始化时指定）而非函数来减少这个调用开销。


?> 以下为草稿

## RTTI

运行时类型识别（RunTime Type Identification, RTTI）是一种 C++ 机制，可以一定程度上简化代码并保证代码的安全性。

## `dynamic_cast`

`dynamic_cast` 目的是为了保证向下转型的安全。为了说明这一点，首先看下面的例子：

```CPP
struct B { };
struct D1 : B {
    int i;
};
struct D2 : B {
    float f;
};
int main() {
    B* b{new D1};
    D2* d2{static_cast<D2*>(b)};
    d2->f; // 未定义行为：d2 实际并不是 D2 类型的而是 D1 类型的
    delete b;
}
```

上面的例子用 `static_cast` 做了从 `B*` 到 `D2*` 的“向下转型”，但它可以非常直接地导致不可预期的未定义行为。此时，`dynamic_cast` 就可以出场了：

```CPP
#include <iostream>
struct B {
    virtual ~B() { }
};
struct D1 : B {
    int i;
};
struct D2 : B {
    float f;
};
int main() {
    B* b{new D1};
    D2* d2{dynamic_cast<D2*>(b)};
    std::cout << d2 << std::endl;
    delete b;
}
```

> RTTI 的实现原理一般是在虚函数表中增加指向 `std::type_info` 的指针。每个 `std::type_info` 根据继承关系构成有向无环图。 `typeid` 直接获取虚函数表中的这个指针，而 `dynamic_cast` 需要在有向无环图中进行遍历搜索直至成功或失败。所以 `typeid` 的运行时性能与一般多态显著无差别，但 `dynamic_cast` 的性能消耗较大。但凡开启了 RTTI，由于需要存储这些 `std::type_info`，编译出的二进制文件也会变大。

