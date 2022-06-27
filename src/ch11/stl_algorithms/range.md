# 初识范围

这一部分开头曾讲过，STL 算法大多作用在序列上。这个序列的正式称呼是**范围**（Ranges）。C++ 为了让范围有更广泛和灵活的含义，便用迭代器来定义它。

具体来说，任意两个迭代器都可以指代一个范围。

![](/assets/range-begin-end.svg)

比如这张图画出了两个迭代器 `begin` 和 `end`。`begin` 迭代器指向一系列元素的第一个，`end` 指向它们的尾后空位。此时，由 `begin` 和 `end` 中间“夹”着的元素序列就是它们所指代的范围。

在程序上看，给定两个迭代器 `i` 和 `s`，通过

```cpp
for (; i != s; ++i) {
    *i; // 访问 *i 或 i->foo
}
```

这种方式访问到的一系列元素，就是 `i` 和 `s` 所指代的范围。

此外，如果一个对象可以提供这样的一对迭代器，则称该对象**满足范围概念**。我有时会简称这样的对象为范围概念。比如 STL 容器 `std::vector` 等都是范围概念：它们提供的 `begin` `end` 成员函数就是一对指代范围的迭代器。数组也是范围概念，对于数组 `int a[N];` 来说，`&a[0]` 和 `&a[N]` 就是一对迭代器，其所指代的范围是全体数组元素。

我们可以将范围概念传入 STL 算法，比如之前介绍的 `rg::sort` 和 `rg::stable_sort`。此外，我们还可以将指代范围的迭代器对传入：

```cpp
#include <vector>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    std::vector a{4, 1, 6, 2};
    rg::sort(a.begin(), a.end()); // 等价于 rg::sort(a);
}
```

这种写法应用在数组上非常方便。

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    int a[10]{4, 1, 6, 2};

    // 只对 a[0] ~ a[3] 排序
    rg::sort(&a[0], &a[4]);

    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

在上一节中我只能将 `a` 整体作为范围概念传入，此时排序的是全体 10 个元素。如果想要对前 4 个元素排序，则必须传入对应的首尾迭代器：首迭代器指向 `a[0]`，尾迭代器指向第四个元素 `a[3]` 的下一元素，也就是 `&a[4]`。

## `rbegin` 与 `rend`

对于可双向迭代的 STL 容器，除了提供 `begin` `end` 这一对迭代器以外，还提供 `rbegin` 和 `rend`。简单来说，`rbegin` `rend` 所指代的范围也是容器内的全体元素，但遍历的方向是从尾到头。

![](/assets/range-rbegin-rend.svg)

这张图的粗实线示意了 `rbegin` 和 `rend` 的指向。其中 `rbegin` 指向容器的最后一个元素，`rend` 指向首元素的前一元素空位。

`rbegin` 和 `rend` 可以简化一些用法。比如从大到小排序时，如果传入 `rbegin` 和 `rend`，那使用默认的“第二实参” `std::less{}` 就可以了：

```cpp codemo
#include <vector>
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    std::vector a{4, 1, 6, 2};
    rg::sort(a.rbegin(), a.rend());
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

## 初识视图

在这一节结尾，我略微介绍一下视图（View）。视图是一种特殊的范围，我这里先举几个例子；具体的概念会在之后的章节展开。

这里首先介绍的是 `rg::reverse_view`。`reverse_view` 可以将一个范围“反转”，即让 `begin` 指向末尾元素，`end` 指向首元素的上一空位，如同 `rbegin` `rend` 那样。

```cpp
#include <vector>
#include <iostream>
#include <algorithm>
#include <ranges> // 视图定义于此
namespace rg = std::ranges;

int main() {
    std::vector a{4, 1, 6, 2};
    rg::sort(rg::reverse_view{a});
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

像这样，`rg::reverse_view{a}` 就将 `a` 这个范围概念反转；它的效果和刚才是一致的。

> 此处使用大括号初始化以避免烦人的分析，尽管目前还不会有。

有趣的是，标准库定义了一系列重载了 `operator|` 的对象；它们定义于 `std::views` 内并且可以生成这样的视图。比如 `std::views::reverse` 就可以生成 `rg::reverse_view`。标准上称这些对象为范围适配器对象。不管怎样，这些对象在 `operator|` 的加成下可以这样用：

```cpp
#include <vector>
#include <iostream>
#include <algorithm>
#include <ranges> // 视图定义于此
namespace rg = std::ranges;

int main() {
    std::vector a{4, 1, 6, 2};
    rg::sort(a | std::views::reverse);
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

事实上，有了范围适配器之后，很少会在算法中用到裸的迭代器了。刚刚说的数组部分排序问题，也可以通过 `rg::take_view` 来做。这个适配器只会保留范围中的前 `n` 个元素，其余元素抛弃。它是这样使用的：

```cpp
#include <iostream>
#include <algorithm>
#include <ranges>
namespace rg = std::ranges;

int main() {
    int a[10]{4, 1, 6, 2};

    // 只对 a[0] ~ a[3] 排序
    rg::sort(rg::take_view{a, 4});
    // 或者...
    rg::sort(a | std::views::take(4));

    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

注意“范围适配器对象”的版本。`operator|` 的语法允许你将范围适配器串联起来用：

```cpp
#include <iostream>
#include <algorithm>
#include <ranges>
namespace rg = std::ranges;

int main() {
    int a[10]{4, 1, 6, 2};

    // 对 a[0] ~ a[3] 倒序排序
    rg::sort(a | std::views::take(4) | std::views::reverse);

    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

虽然这些库设施的定义很复杂，但使用起来非常的优雅；甚至性能上也会更好。这也是 STLv2 相比传统版本的改进之处。
