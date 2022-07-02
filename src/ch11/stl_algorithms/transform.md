# 变换

下一个函数式特性是变换（Transform），别的编程语言习惯叫做映射（Map）。所谓的变换，就是让一个范围内的每个值都通过一个函数转换为另一个值，最后再把转换后的值收集起来。

> 由于 C++ 把 Map 这个词解释为词典（`std::map`）了，所以换了个词。

同样地，先介绍相对传统的 `rg::transform`。它和 `rg::copy` 类似，需要提供目的地参数。它使用起来长成这样：

```cpp codemo
#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>
namespace rg = std::ranges;

int main() {
    std::vector<int> a{1, 2, 3, 4, 5};
    std::vector<int> b;
    rg::transform(a, std::back_inserter(b), [](int x) {
        return x * x;
    });
    for (auto i : b) {
        std::cout << i << ' ';
    }
}
```

这里，`rg::transform` 典型地接受三个参数：第一个是要作用的范围；第二个是目的地，最后一个是变换函数。这里的变换函数是平方 $y=x^2$，要作用的范围是向量 `a`，里面存放的是 5 个整数。整个 `rg::transform` 会将变换函数一一地作用在范围内的每个值上，然后将返回的结果存放到目的地内。

$$\bm a=\{x\}\xrightarrow{\operatorname{transform}(f)}\{f(x)\}\eqqcolon\bm b$$

整段代码运行后，结果就是 `1 4 9 16 25 `，即原先 `a` 里的每个元素的平方。

类似地，也有它对应的视图 `rg::transform_view` 和范围适配器 `std::views::transform`。在范围适配器的语法下，刚刚的代码可以直接写成这样：

```cpp codemo
#include <iostream>
#include <vector>
#include <algorithm>
#include <ranges>
namespace rg = std::ranges;

int main() {
    std::vector<int> a{1, 2, 3, 4, 5};
    for (auto i : a
        | std::views::transform([](int x) { return x * x; })) {
        std::cout << i << ' ';
    }
}
```

下面展示一个复杂的例子。假设有这样的需求：从输入读取若干个数；取前 5 个正数的算术平方根。这段程序可以这样写：

```cpp codemo(input=1 -4 2 -6 3 5 -2 0 4 -6 7)
#include <iostream>
#include <algorithm>
#include <vector>
#include <iterator>
#include <cmath>
namespace rg = std::ranges;

int main() {
    std::vector<int> a;
    // 输入
    int x;
    while (std::cin >> x) {
        a.push_back(x);
    }
    // 筛选出正数
    std::vector<int> b;
    rg::copy_if(a, std::back_inserter(b), [](int x) {
        return x > 0;
    });
    // 取前 5 个
    if (b.size() > 5) {
        b.resize(5);
    }
    // 取平方根
    std::vector<double> c;
    rg::transform(b, std::back_inserter(c), [](int x) {
        return std::sqrt(x);
    });
    // 输出
    for (auto i : c) {
        std::cout << i << ' ';
    }
}
```

看上去略微有些凌乱。但我们可以用范围适配器的语法极大地简化整个流程：

```cpp codemo(input=1 -4 2 -6 3 5 -2 0 4 -6 7)
#include <iostream>
#include <algorithm>
#include <vector>
#include <ranges>
#include <cmath>
namespace rg = std::ranges;

int main() {
    std::vector<int> a;
    // 输入
    int x;
    while (std::cin >> x) {
        a.push_back(x);
    }
    for (auto i : a
        | std::views::filter([](int x) { return x > 0; })
        | std::views::take(5)
        | std::views::transform([](int x) { return std::sqrt(x); })) {
        std::cout << i << ' ';
    }
}
```

你甚至可以更激进地，使用输入视图 `std::views::istream` 和输出迭代器 `std::ostream_iterator`。此时，可以直接用 `rg::copy` 将输入和输出“连接”起来。

```cpp codemo(input=1 -4 2 -6 3 5 -2 0 4 -6 7)
#include <iostream>
#include <algorithm>
#include <iterator>
#include <ranges>
#include <cmath>
namespace rg = std::ranges;

int main() {
    rg::copy(std::views::istream<int>(std::cin)
            | std::views::filter([](int x) { return x > 0; })
            | std::views::take(5)
            | std::views::transform([](int x) { return std::sqrt(x); }),
        std::ostream_iterator<double>{std::cout, " "});
}
```

所谓的“函数式编程思想”的一大特点就是，只考虑数据如何通过若干函数变换，写代码相当于将变换的过程描述出来；此外，不考虑具体怎样实现、数据如何存储、程序如何运行。上面的这段代码充分展现了这一特点：它只描述了从输入数据一步一步转换到输出的步骤，不再引入循环、变量等具体的实现细节。因此，函数式编程减轻了程序员的负担，也让代码更容易阅读。
