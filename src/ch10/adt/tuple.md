# 通用积类型 `std::tuple`

`std::tuple` 是一个类模板。准确地说，它是一个**变参模板**，即模板参数的个数是可变的。变参模板的具体写法会在之后的章节展开，这里你只需要知道 `std::tuple` 可以接受任意多个类型作为其模板实参。比如 `std::tuple<>` 是不接受任何模板参数的类，`std::tuple<int>` 是接受一个的，`std::tuple<unsigned, bool>` 是两个参数的等等。

标题也表明了，`std::tuple` 代表了积类型——所以 `std::tuple<T1, T2, ...>` 类就是一个通用的，指代 `T1` $\times$ `T2` $\times \cdots$ 这个积的类型。
```cpp
using ProductType = std::tuple<unsigned, bool>;

ProductType t; // t 具有 unsigned x bool 积类型，取值为两者的笛卡尔积中的元素
```

积运算的单位元叫做 **1 类型**，也叫做**空元组类型**，在 C++ 中就是 `std::tuple<>`。之所以叫 1 类型是因为这个类型只有一种可能的值，就是空元组本身 `std::tuple<>{}`。

## 访问 `std::tuple` 的分量

与具名的结构体不同，`std::tuple` 中不会指定每个分量（成员）的名字，你只有对应分量的索引可以使用。比如上文中 `ProductType` 类型的第 0 个分量是 `unsigned` 类型的值，第 1 个分量是 `bool` 类型的值，整个 `std::tuple` 的值就由这两个分量构成。因此并没有类似成员访问运算符（`.`）那样方便的方法可以访问到具体的分量，这里需要用到的是标准库函数 `std::get`。

访问 `std::tuple` 变量 `t` 的第 `N` 个分量，应当使用 `std::get<N>(t)`。比如：

```cpp codemo
#include <iostream>
#include <tuple> // std::tuple 定义于此
using ProductType = std::tuple<unsigned, bool>;

int main() {
    ProductType a;    // 默认构造
    std::get<0>(a) = 42u;
    std::get<1>(a) = true;
    ProductType b{a}; // 复制构造
    std::cout << std::get<0>(b) << " "
              << std::get<1>(b) << std::endl;
}
```

> 有点丑陋，对吧。但目前没有什么更好的写法了。曾经有人向标准委员会提出一些简化的提案，但是委员会专家们对此似乎没有兴趣。

## 注意事项

尽管数学家热爱 `std::tuple`，但是在编写代码时，素质优秀的程序员应当减少它们的使用。原因很简单——现实世界的事物是有意义而非抽象的。举一个例子：

```cpp

```
