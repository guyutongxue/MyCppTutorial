# STL 算法

STL 分为容器、迭代器和算法三个部分；我在[第八章](/ch08/stl_containers/)中简单介绍了容器和迭代器。STL 算法的部分，则是包装了在容器上的一些常见操作。

类似迭代器，STL 算法在 C++20 之后进行了一次大的改动。这使得 STL 算法分为两个版本：传统（Legacy）版本和约束（Restrained）版本：传统版本的算法定义于 `std` 命名空间，而约束版本的算法定义于 `std::ranges` 命名空间。约束算法使用起来比传统算法更容易，因此我这里就先介绍这种被称为“STLv2”的约束算法。

<!--
```cpp
#include <algorithm>         // STL 算法大多定义于此
using namespace std;         // 若使用传统算法
using namespace std::ranges; // 若使用约束算法
```
-->

## 算法的分类

STL 算法库基本都是作用在序列上的，比如数组、`std::vector` 等容器。这些算法包括排序、取最值、做筛选和映射等等。

比如，排序算法 `std::ranges::sort`：

```cpp codemo
#include <iostream>
#include <vector>
#include <algorithm> // 算法库大多定义于此

// 为了简便，将 rg 作为命名空间 std::ranges 的别名
// 这样，rg::xyz 就是 std::ranges::xyz 的别名
namespace rg = std::ranges;

int main() {
    std::vector a{4, 1, 6, 2};
    rg::sort(a);
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

这段代码会将容器 `a` 中的元素从小到大排序；最终输出的就是 `1 2 4 6`。又比如最值算法 `std::ranges::max`：

```cpp codemo
#include <iostream>
#include <algorithm> // 算法库大多定义于此
namespace rg = std::ranges;

int main() {
    int a[]{4, 1, 6, 2};
    std::cout << rg::max(a) << std::endl;
}
```

这样的代码会输出 `a` 中的最大元素值。

接下来，我们先从实践出发，讲讲最常用的算法—— `sort`。

<!-- 
## 范围（Ranges）

之前在讲什么是迭代器时，用到了这样一张图：

<img src="/assets/range-begin-end.svg" alt="begin and end iterator">

这张图除了演示容器的首迭代器和尾迭代器含义外，还表达了这样的意思：如果提供一对迭代器，其中一个作为首（记作 `i`），另外一个作为尾（记作 `s`）；那么**这对迭代器就能表示一系列有序数据**：比如 `*i` `*(i + 1)` ... `*(s - 1)`。最基本的遍历这些数据的写法是：

```cpp
for (; i != s; ++i) {
    std::cout << *i << std::endl;
}
```

如同范围 for 那样，这我们已经熟悉了。C++ 标准中引入了这些更规范的术语：
- 称 `i` `s` 这样一对迭代器所指代的这些数据为**范围**（Range）；
- 迭代器对 `i` `s` 在部分语境下称作**迭代器-哨位对**（Iterator-sentinel pair）；
- 如果一个东西能够提供首迭代器和尾迭代器，那么称这个东西为**范围概念**（Range concept）。

其中，容器就是最常见的范围概念，它所指代的范围就是其 `begin()` 迭代器到 `end()` 迭代器之间的元素。此外，数组也是范围概念，它所指代的范围则是全体数组元素。

STL 算法大多是在范围上作用的算法。比如最常见的，给一个范围内的元素排序：

```cpp codemo(show)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std::ranges;

int main() {
    std::vector a{3, 1, 0, 2};

    // std::ranges::sort 将范围内元素从小到大排序
    // 用迭代器-哨位对表示范围...
    sort(a.begin(), a.end());
    // ...或者直接传入范围概念，也就是容器本身
    sort(a);

    for (int i : a) {
        std::cout << i << ' ';
    }
}
```

`std::ranges::sort` 就是一个 STL 算法（为行文方便，后省略 `std::ranges` 命名空间名）。当使用这样的范围上算法时，需要传入一个范围。刚刚的例子演示了两种传入范围的方式：
1. 传入指代该范围的迭代器-哨位对；
2. 传入范围概念。

希望读者能够将这种代码书写方式作为“常识”。我们这一部分介绍的大量 STL 算法都是这样使用的，故不会再一一详细说明。

> 再次说明，上文中的算法总是约束版本的，而非传统版本的。传统版本算法不支持第 2 种表示范围的方式（即传入范围概念），如果你的编译器不支持约束版本算法，则需稍加留意。

-->
