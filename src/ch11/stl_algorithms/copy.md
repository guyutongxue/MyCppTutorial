# 复制

接下来介绍 STL 算法 `copy`。它可以用来复制一个范围到别的地方，比如：

```CPP
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

int main() {
    std::vector a{1, 3, 5, 7, 9};
    std::vector<int> b(5); // 持有 5 个零的 vector
    copy(a, b.begin());
    // 或者
    copy(a.begin(), a.end(), b.begin());

    for (int i : b) {
        std::cout << i << std::endl;
    }
}
```

传入 `copy` 的参数包括待复制的范围，以及一个额外的参数——目的地，也就是刚刚例子中的 `b.begin()`。复制范围时，会将待复制的范围逐一填到 `b.begin()` 所指向的位置；具体而言，同时步进待复制范围的起始迭代器和目的地迭代器，复制元素，直至范围的起始迭代器抵达终止迭代器。简单的实现如下：

```cpp
template<typename I, typename S, typename O>
void copy(I begin, S end, O dest) {
    while (begin != end) {
        *dest = *begin;  // 复制元素
        ++begin, ++dest; // 步进两个迭代器
    }
}
```

> 这个实现是极其简化的，省略了一些优化，忽略了返回值。此外，这更像传统版本的实现；约束版本（包括传入范围概念的版本）没有给出。

值得注意的是，`copy` 算法要求目的地参数 `dest` 具有这样的性质：
1. 是个迭代器，`*dest` 和 `++dest` 是合法表达式；
2. `*dest = ...` 是合法表达式。

其中第二条要求并不在[第八章](/ch08/stl_containers/iterator_concept.md)提到的任何一种迭代器概念的规定内。事实上，满足这两条性质的迭代器是一种全新的概念——*输出迭代器（Output Iterator）*。相比之前的输入、前向、双向、随机访问、连续迭代器，输出迭代器的要求少了很多，只要可以解地址和自增就行；但额外地增加了**可以为该元素赋值**的要求。

既然 `copy` 仅要求目的地参数是输出迭代器，那么利用这一点可以写出更有意思的代码。比如，倘若重载一个迭代器的赋值运算符，改为向 `vector` 添加元素，那就可以实现这样的代码：

```cpp
struct Inserter { /* [...] */ };

int main() {
    std::vector a{1, 3, 5, 7, 9};
    std::vector<int> b{}; // 初始长度为 0（此时向 copy 传入 b.begin() 导致越界）
    copy(a, Inserter(b)); // 复制时向 b 末尾插入新的元素
    
    // 1 3 5 7 9
    for (int i : b) { std::cout << i << ' '; }
}
```

`Inserter` 可以这样实现：

```cpp
struct Inserter {
    // 这两行不用管，仅为编译通过
    Inserter() = default; // required before P2325 by std::default_initializable
    using difference_type = std::ptrdiff_t; // required by std::weekly_incrementable

    std::vector<int>* container{nullptr};
    Inserter(std::vector<int>& c) : container{&c} { }

    // ++dest; 和 dest++; 啥也不干
    Inserter& operator++() { return *this; }
    Inserter& operator++(int) { return *this; }

    // 令 *dest = v; 相当于 dest = v;
    Inserter& operator*() { return *this; }

    // dest = v; 将 v 插入到容器中
    Inserter& operator=(int val) {
        container->push_back(val);
        return *this;
    }
};
```

此时，`copy` 实现中的 `*dest = *begin` 就相当于 `b.push_back(*begin)` 了。我们刚刚实现的 `Inserter` 在标准库中已有提供，即为 `std::back_inserter`：

```CPP
#include <iostream>
#include <algorithm>
#include <vector>
#include <iterator> // std::back_inserter 定义于此
using namespace std::ranges;

int main() {
    std::vector a{1, 3, 5, 7, 9};
    std::vector<int> b{};
    copy(a, std::back_inserter(b)); // 复制时向 b 插入元素
    
    // 1 3 5 7 9
    for (int i : b) { std::cout << i << ' '; }
}
```

此外，输出迭代器还有更多有意思的用法。比如，重载其复制运算符使得其通过 `cout` 输出该元素。这样的输出迭代器就是 `std::ostream_iterator`，它的使用方法如下：

```CPP
#include <iostream>
#include <algorithm>
#include <vector>
#include <iterator> // std::ostream_iterator 定义于此
using namespace std::ranges;

int main() {
    std::vector a{1, 3, 5, 7, 9};
    // 输出 a 中的元素
    copy(a, std::ostream_iterator<int>(std::cout));
}
```

`std::ostream_iterator` 接受一个模板类型参数，表明待输出元素的类型。构造时，需要传入 `std::cout` 以输出到屏幕。（你也可以传入一个 `std::ofstream` 类型对象以输出到文件。）此外，构造时还可提供额外的第二实参，表示输出元素后的分隔字符串：

```CPP
#include <iostream>
#include <algorithm>
#include <vector>
#include <iterator>
using namespace std::ranges;

int main() {
    std::vector a{1, 3, 5, 7, 9};
    // 输出 a 中的元素，但以空格分隔
    copy(a, std::ostream_iterator<int>(std::cout, " "));
}
```

<!-- > 类似地，既然有面向 `std::ostream` 的输出迭代器，自然也有面向 `std::istream` 的输入迭代器。但是，构造这样的输入迭代器相比要复杂一点，我建议使用 `std::views::istream` 函数。它接受一个 `std::istream`（如 `std::cin` 等），并返回一个范围概念。可直接从这个范围复制元素到别的地方：复制时，不断从输入流中取出元素，以空格分隔，直至 EOF。使用 `std::views::istream` 时，还需要传入元素类型作为模板实参。用例如下：
> 注释掉。此函数（CPO）由缺陷报告 P2432 引入，libstdc++ 尚不支持。
>  -->

## 练习

`std::ostream_iterator` 的实现和刚刚我们写的 `Inserter` 非常类似，即通过重载 `operator=` 改变复制行为。你可以试一试自己实现一个简单版本的 `std::ostream_iterator`（仅输出 `int` 类型，仅输出到 `std::cout`）。

参考答案：

```CPP
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

struct CoutIter {
    // 仅为编译通过
    using difference_type = std::ptrdiff_t;

    const char* delim{nullptr};
    CoutIter(const char* delim = "") : delim{delim} { }

    CoutIter& operator++() { return *this; }
    CoutIter& operator++(int) { return *this; }
    CoutIter& operator*() { return *this; }

    CoutIter& operator=(int val) {
        std::cout << val << delim;
        return *this;
    }
};

int main() {
    std::vector a{1, 3, 5, 7, 9};
    copy(a, CoutIter(" "));
}
```