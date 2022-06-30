# 筛选

现在说说 STL 中带有函数式特点的东西。第一个就是筛选（Filter），即只保留一个范围中符合特点的元素。

传统上，这个需求可以用 `rg::copy_if` 算法来实现。它用起来长成这个样子：

```cpp codemo
#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>
namespace rg = std::ranges;

int main() {
    std::vector<int> a{4, 1, 6, 2, 9, 5};
    std::vector<int> b;
    rg::copy_if(a, std::back_inserter(b), [](int x) {
        return x < 5;
    });
    for (auto i : b) {
        std::cout << i << ' ';
    }
}
```

`rg::copy_if` 顾名思义，就是选择性地复制部分元素，可以算是复制算法 `rg::copy` 的加强版。对于 `rg::copy` 来说，它会将原始范围内的全部元素复制到目的地；而 `rg::copy_if` 在复制之前会检查当前被复制的元素是否满足“第三参数”，只有满足时才会复制。其中，“第三参数” 是一个可调用对象，期望一个元素类型的参数并返回 `bool`。如果该函数作用在当前元素上返回 `true` ，那么该元素就会被复制。

$$\bm a=\{x\}\xrightarrow{\operatorname{filter}(f)}\{x\mid f(x)\}=\bm b$$

刚才示例代码中的“第三参数”，是返回 `x < 5` 的 Lambda 表达式，意思就是只有小于 5 的元素才会被复制。当然，你也可以传递一个普通的函数。

```cpp codemo
#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>
namespace rg = std::ranges;
// codemo show
bool lessThen5(int x) {
    return x < 5;
}
int main() {
    std::vector<int> a{4, 1, 6, 2, 9, 5};
    std::vector<int> b;
    rg::copy_if(a, std::back_inserter(b), lessThan5);
    // codemo hide
    for (auto i : b) {
        std::cout << i << ' ';
    }
    // codemo show
}
```

总之，`rg::copy_if` 通过有选择地复制，实现了对批量数据的筛选。但它用起来并不方便；其最主要原因是需要提供一个目的地。虽然这个目的地可以是任意迭代器，但如果要收集到一个新的容器，则要么初始化好这个容器的大小，要么使用 `std::back_inserter`。这在使用上略显啰嗦。

STLv2 提供了 `rg::filter_view` 视图来改进筛选的写法。在 `rg::filter_view` 中，步进迭代器时会检查当前元素是否满足条件；如果不满足条件则继续步进。这样，最终返回的迭代器总是指向满足条件的元素。

范围适配器 `std::views::filter` 可以方便地生成 `rg::filter_view`。它用起来是这样写的：

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <ranges>
namespace rg = std::ranges;

int main() {
    std::vector<int> a{4, 1, 6, 2, 9, 5};
    // b 是 rg::filter_view 视图
    auto b = a | std::views::filter([] (int x) { return x < 5; });
    for (auto i : b) {
        std::cout << i << ' ';
    }
}
```

但是有一点需要注意，`b` 在这里是视图而不是容器。视图和容器的区别在于，视图是“惰性求值”的。只要 `b` 的迭代器没有被使用，`b` 的筛选逻辑就不会运行。视图本身只存储两个迭代器，而迭代器所指向的内容仍然是 `a` 所持有的；在使用 `b` 的迭代器后，`b` 才会执行筛选条件，步进迭代器，并返回 `a` 所存储的内容。换句话说，`b` 不持有数据的所有权。

如果要把视图 `b` 的内容收集到容器里，我们可以用 `rg::to<std::vector>`。但很遗憾的是，`rg::to` 在近期（2022 年 1 月）才被添加到 C++2b 标准，目前尚没有主流编译器支持。
