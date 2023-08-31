# 通用积类型 `std::tuple`

`std::tuple` 是一个类模板。准确地说，它是一个**变参模板**，即模板参数的个数是可变的。变参模板的具体写法会在之后的章节展开，这里你只需要知道 `std::tuple` 可以接受任意多个类型作为其模板实参。比如 `std::tuple<>` 是不接受任何模板参数的类，`std::tuple<int>` 是接受一个的，`std::tuple<unsigned, bool>` 是两个参数的等等。

标题也表明了，`std::tuple` 代表了积类型——所以 `std::tuple<T1, T2, ...>` 类就是一个通用的，指代 `T1` $\times$ `T2` $\times \cdots$ 这个积的类型。如果将 `std::tuple` 视为不具名的结构体，那可以说它有若干个 *成员*，类型分别是 `T1` `T2` ……，在数学上则通常管这个有序数组的每个文字叫**分量**。下文中就不再区分分量和成员，都指代组成 `std::tuple` 的具体部分。
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

## `std::tuple` 的构造

从刚才的例子中可以看出，`std::tuple` 至少支持默认构造和复制构造。两者都是简单地调用各个成员的默认初始化或复制初始化。但除此之外，`std::tuple` 还有其它的构造方式——`std::tuple` 拥有整个 C++ 标准库数量最多的构造函数重载，至 C++23 共有 28 个，非常琐碎。

对于我们这种普通用户来说，除了默认构造、复制构造和移动构造这些特殊函数之外，通常只会用到一种“逐成员指定初始化值”的构造方法，比如：

```cpp
#include <tuple>
using ProductType = std::tuple<unsigned, bool>;

int main() {
    ProductType a(42u, false);
    // [...]
}
```

这种构造方法支持类模板实参推导（CTAD），即通过构造函数实参来指定各个分量的类型（模板实参）：

```cpp
#include <tuple>

int main() {
    std::tuple a(42u, false);
    // a 推导为 std::tuple<unsigned, bool>
}
```

## 引用成员

`std::tuple` 可以持有引用类型的成员。这意味着对这些成员做修改，相当于修改其原先绑定的成员。例如：

```cpp codemo
#include <tuple>
#include <iostream>

int main() {
    int x{42}, y{56};
    std::tuple<int&, int&> t(x, y);
    std::get<0>(t) = 30;
    std::get<1>(t) = 50;
    std::cout << x << " " << y << std::endl;
}
```

这里会输出 `30 50`，因为对 `t` 的两次赋值是对引用——也就是作为 `x` 或 `y` 的别名——的赋值。

需要注意的一点是，这里必须指明 `t` 的类型为 `std::tuple<int&, int&>`。如果不指明模板实参，CTAD 会从构造函数实参推导为 `std::tuple<int, int>`。为了减少这些代码，C++ 提供了一个简便设施 `std::make_tuple`。

`std::make_tuple` 在一般的使用上和直接调用构造函数没有区别。但是，如果你用标准库函数 `std::ref` 将某个实参引起来，那么它将成为一个引用的初始化值。

```cpp codemo
#include <tuple>

int main() {
    unsigned x{42u};

    // std::tuple<unsigned, bool>
    // 等价于 std::tuple t1(x, false);
    auto t1 = std::make_tuple(x, false);

    // std::tuple<unsigned&, bool>
    auto t2 = std::make_tuple(std::ref(x), false);
}
```

> 具体而言，`std::ref` 函数返回一个保有原对象指针的类 `std::reference_wrapper`。`std::make_tuple` 对 `std::reference_wrapper` 有特殊的处理。

## 注意事项

尽管数学家热爱 `std::tuple`，但是在编写代码时，素质优秀的程序员应当减少它们的使用。原因很简单——现实世界的事物是有意义而非抽象的。举一个例子：

```cpp

```
