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

