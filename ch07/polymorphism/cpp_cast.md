# C++ 风格类型转换

## 引入：向下转型

接下来几节将用于解决安全向下转型的问题。考虑之前的代码：
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

一旦