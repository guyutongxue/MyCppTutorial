# 排序

我们在刚刚已经见过了排序算法的基本使用。看上去很简单，就是将一个容器/数组传到 `rg::sort` 里面，然后这个容器/数组就从小到大排好序了。

但仍然有一些细节问题。比如：如何从小到大排？

其实仅就这个问题而言，它是比较容易解决的：`rg::sort` 还有一个额外的默认实参 `rg::less{}`：

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    int a[]{4, 1, 6, 2};
    // codemo show
    rg::sort(a, rg::less{}); // 等价于 rg::sort(a)
    // codemo hide
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

而将这个参数改为 `rg::greater{}` 即可从大到小排了！

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    int a[]{4, 1, 6, 2};
    rg::sort(a, rg::greater{});
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

## 这个“第二实参”到底是什么？

其实，`rg::less` 和 `rg::greater` 是两个类，而它们的对象都重载了 `operator()`。大约就是类似下面这种：

```cpp
struct less {
    bool operator()(auto a, auto b) const {
        return a < b;
    }
};
struct greater {
    bool operator()(auto a, auto b) const {
        return a > b;
    }
}
```

也就是说，`rg::less{}` 和 `rg::greater{}` 是两个“函数对象”——我们之前提到的相关语法在这里出现了：你可以直接在这里使用一个 Lambda 表达式，效果相同：

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    int a[]{4, 1, 6, 2};
    // codemo show
    rg::sort(a, [](int a, int b) {
        return a > b;
    }); // 从大到小排
    // codemo hide
    for (auto i : a) {
        std::cout << i << ' ';
    }
}
```

但为什么传入一个 `return a < b` 的函数对象就让 `rg::sort` 从小到大排；反之传入 `a > b` 就是从大到小呢？这里，需要稍微解释 `rg::sort` 的工作流程：

`rg::sort` 基于元素的交换来排序。默认情况下（也就是传入 `rg::less{}` 时），如果“元素 `a` 小于元素 `b`”则将 `a` 排到 `b` 前面。当不停地交换到任意两个元素都符合该先后顺序时，整个序列就从小到大排好了。

为了让排序算法更通用，刚才引号引起的部分被更广泛的解释为：设传入的第二参数为 `comp`，若 `comp(a, b)`，则将 `a` 排到 `b` 前面。比如传入默认实参 `rg::less{}`，`rg::less{}(a, b)` 返回 `true` 就等价于 `a < b`。于是，`a < b` 时就会将 `a` 排在 `b` 前面。类似地，`rg::greater{}(a, b)` 等价于 `a > b`，即 `a > b` 时将 `a` 排在前面：总的下来就是从大到小的顺序了。

## 结构体的比较

一般来说，如果这个容器/数组里的对象定义了比较运算符，那么它就可以传入到 `rg::sort` 里排序，并用可选的“第二实参”控制升序或者降序。但如果这个对象没有定义比较运算符怎么办？

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

struct Coord {
    int x, y;
};
int main() {
    Coord a[]{{3, 1}, {2, 4}, {0, 5}};
    rg::sort(a); // 报错：未定义比较运算符
}
```

有两种解决方法，一是给出比较运算符的定义，参考[之后的章节](../advanced/defaulted_compare.md)；二就是用自定义的函数对象担当“第二参数”来比较：

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

struct Coord {
    int x, y;
};
int main() {
    Coord a[]{{3, 1}, {2, 4}, {0, 5}};
    // codemo show
    rg::sort(a, [](const Coord& a, const Coord& b) {
        return a.x < b.x;
    }); // x 成员比较小的排在前面
    // codemo hide
    for (const auto& i : a) {
        std::cout << "(" << i.x << ", " << i.y << ") ";
    }
}
```

### 稳定排序与不稳定排序

`rg::sort` 是不稳定排序。所谓的不稳定是指，如果两个元素在比较时被认为是相等的，则它们出现的顺序是任意的。而稳定排序中，两个相等元素的相对顺序总保持和最初一致。

这在结构体排序中需要注意。比如下面的代码：

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

struct Coord {
    int x, y;
};
int main() {
    // codemo show
    Coord a[]{{1, 5}, {0, 3}, {0, 1}};
    rg::sort(a, [](const Coord& a, const Coord& b) {
        return a.x < b.x;
    }); // x 成员升序排列
    // codemo hide
    for (const auto& i : a) {
        std::cout << "(" << i.x << ", " << i.y << ") ";
    }
}
```

`rg::sort` 之后，我们不知道 `{0, 3}` 和 `{0, 1}` 哪个在前面：因为它们被判定为相等元素。判定为相等是因为，我们传入的“第二实参”只规定 `x` 小的排前面；而这两个对象的 `x` 是相同的，在排序时就无法确定哪个更小。最终的结果就是这两个元素的先后顺序不确定。

而稳定排序 `rg::stable_sort` 则保证排完序后 `{0, 3}` 出现在 `{0, 1}` 之前。尽管它们“相等”，但最初 `{0, 3}` 就在前面，故排完之后也在前面。理论上，稳定排序比不稳定排序会慢一点。

```cpp codemo
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

struct Coord {
    int x, y;
};
int main() {
    // codemo show
    Coord a[]{{1, 5}, {0, 3}, {0, 1}};
    rg::stable_sort(a, [](const Coord& a, const Coord& b) {
        return a.x < b.x;
    }); // x 成员升序排列
    // codemo hide
    for (const auto& i : a) {
        std::cout << "(" << i.x << ", " << i.y << ") ";
    }
}
```

> 据称，常见的标准库实现 `libstdc++` 和 `libc++` 的 `rg::sort` 对 $\leqslant 16$ 个元素的序列是稳定的；故这里的示例代码看不出 `rg::sort` 和 `rg::stable_sort` 的区别。我[在这里](https://godbolt.org/z/q76nobT87)添加了一个 `rg::sort` 不稳定的例子。

此外，我们还有一些问题：在使用数组时，数组大小超过有意义元素个数是很常见的。怎么对这些元素排序？

```cpp
#include <iostream>
#include <algorithm>
namespace rg = std::ranges;

int main() {
    int a[10]{1, 2, 3};
    // 只对 a[0] ~ a[2] 排序
    rg::sort(a); // 做不到
}
```

我将会在下一节解答这个问题。下一节，将用到迭代器相关的内容

<!-- 
首先介绍刚刚提到的排序算法，`sort`。它是最常用的 STL 算法之一，使用起来也很方便：

```cpp codemo(show)
#include <algorithm>
#include <vector>
using namespace std::ranges;

int main() {
    // 可传入范围概念
    std::vector a{3, 0, 2, 1};
    sort(a);

    // 排序数组时，可传入迭代器（也就是指针）
    int b[10]{3, 0, 2, 1};
    sort(&a[0], &a[4]); // 对前 4 个元素排序
}
```
排序算法要求该范围的迭代器满足 *随机访问迭代器* 的要求，也称这样的范围是 *随机访问范围*。（类似地，*双向迭代器* 所指代的范围被称为 *双向范围*，以此类推。）

排序的结果是整个范围内的元素从小到大排列。上面的代码中，`a` 和 `b` 最终都是 `{0, 1, 2, 3}` 这样。如果想要从大到小排序，有多种做法。首先，如果待排序的范围是容器本身，则可以利用容器提供的 `rbegin()` 与 `rend()` 成员。它们会返回这个容器的**逆向迭代器**（Reverse iterator）：

<img src="/assets/range-rbegin-rend.svg" alt="逆向迭代器">

所谓的逆向迭代器，就是自增减方向与普通迭代器相反的迭代器。当一个逆向迭代器自增时，其所指向的元素变为前一个元素。`rbegin()` 返回的，是指向最后一个元素的迭代器；而 `rend()` 则是指向第一个元素的前一“伪元素”的迭代器。上图中**粗箭头**表示这一对正、逆向迭代器指向同一个元素。

> 图中的细虚剪头则是“自……构造”关系。所有的反向迭代器都是 `std::reverse_iterator<T>` 的实例，其中 `T` 是一个正向迭代器；所有的反向迭代器都需要从一个 `T` 类型的正向迭代器构造而来。容器中，自 `end()` 正向迭代器构造的反向迭代器就是 `rbegin()`。

因此，如果将 `rbegin()` `rend()` 传入 `sort` 算法，得到的恰好是逆序排序的结果：

```cpp codemo(show)
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

int main() {
    std::vector a{3, 0, 2, 1};
    sort(a.rbegin(), a.rend());

    for (int i : a) {
        std::cout << i << std::endl;
    }
}
```

但如果待排序范围来自数组，那就没有 `rbegin()` `rend()` 这么方便的东西了。

> 当然你也可以按照我刚刚所说的，从 `std::reverse_iterator` 构造数组的逆向迭代器：
> ```cpp codemo(show)
> #include <iostream>
> #include <algorithm>
> #include <iterator> // std::reverse_iterator 定义于此
> using namespace std::ranges;
> int main() {
>     int a[10]{3, 0, 2, 1};
>     std::reverse_iterator<int*> rbegin(&a[4]), rend(&a[0]);
>     sort(rbegin, rend);
>     for (int i : a) { std::cout << i << std::endl; }
> }
> ```
> 此外，`std::rbegin(a)` 和 `std::rend(a)` 返回数组或容器 `a` 的逆向首尾迭代器。

这时，我们需要利用 `sort` 的额外参数——排序依据——来改变默认的排序规则。默认的排序规则是：如果 `a < b`，则将 `a` 排在 `b` 的前面。这句话可以用一个函数来描述：

```cpp
bool should_a_in_front_of_b(int a, int b) {
    return a < b;
}
```

当指定 `sort` 的排序规则时，就需要额外地传入一个这样的函数。比如下面的代码可以从大到小排：

```cpp codemo(show)
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

// 当 a 比 b 大时，将 a 排在 b 前面
bool should_a_in_front_of_b(int a, int b) {
    return a > b;
}

int main() {
    std::vector a{3, 0, 2, 1};
    sort(a, should_a_in_front_of_b);

    for (int i : a) {
        std::cout << i << std::endl;
    }
}
```

这个 `should_a_in_front_of_b` 就是指定给 `sort` 的排序依据了；它仅当 `a > b` 时函数返回 `true`。此时，`sort` 就会仅当 `a > b` 时才会将 `a` 排在 `b` 前面；最终的排序效果就是从大到小排列。

事实上，只要传入一个可以调用的对象就可以，不一定是函数（指针）。所以更优雅的写法是传入 Lambda 表达式：

```cpp codemo(show)
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

int main() {
    std::vector a{3, 0, 2, 1};
    sort(a, [](int a, int b) { return a > b; });

    for (int i : a) {
        std::cout << i << std::endl;
    }
}
```

这段代码与之前的效果是相同的。如果不提供这样的排序依据，那么 `sort` 会使用默认实参——标准库中的 `std::ranges::less{}` （或 `std::less{}`，取决于 `sort` 是约束版本还是传统版本）——作为排序依据。这个排序依据就是“如果 `a < b`，则将 `a` 排在 `b` 前面”。但并不是所有的 `a < b` 都是合法表达式。比如自定义的结构体，它没有重载 `operator<` 时，`a < b` 就是非法的。那么此时若不提供自定义的排序依据，那默认排序依据 `std::ranges::less{}` 就会报错。

所以，在目前阶段若对结构体排序，总是需要传入排序依据。此外，我们还建议在排序依据中使用引用传参，避免不必要的开销；尤其是类中持有 `new` 指向的指针时。

```cpp codemo(show)
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

struct S {
    int x, y;
};

int main() {
    std::vector<S> a{{3, 0}, {2, 1}};
    sort(a, [](const S& a, const S& b) { return a.x < b.x; });

    for (S& i : a) {
        std::cout << i.x << ' ' << i.y << std::endl;
    }
}
```

> 对于传统版本的 `std::sort`，可以通过重载待排序结构体的 `operator<` 来使用默认排序依据。但约束算法 `std::ranges::sort` 的默认排序依据要求结构体必须定义全部六个比较运算符，这时我建议指定结构体的[预置比较](/ch11/stl_algorithms/defaulted_compare.md)。

当为结构体排序时，可能出现排序**稳定性**的问题。稳定性是指，在特定排序依据下表现为“相等”的元素，应当如何处理。比如刚才的代码中，我将排序依据设为 `x` 成员的大小：即 `x` 较小的排在前面。但如果有两个结构体 `{1, 2}` 和 `{1, 3}`，它们的 `x` 成员相同，此时应当谁排在前面呢？事实上对于 `sort` 来说，谁在前面是不确定的，这种排序称为**不稳定排序**。不稳定排序算法中，相等元素的相对顺序可能发生改变。与此对应的则是**稳定排序**，它保证相等元素的相对顺序不变。比如刚刚的 `{1, 2}` 和 `{1, 3}`，如果原序列里 `{1, 2}` 排在前面，那排序结果中也排在前面，反之同理。

STL 算法 `stable_sort` 实现了稳定排序。例子如下：

```cpp codemo(show)
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std::ranges;

struct S {
    int x, y;
};

int main() {
    std::vector<S> a{{2, 1}, {1, 3}, {1, 2}};
    stable_sort(a, [](const S& a, const S& b) { return a.x < b.x; });

    for (S& i : a) {
        std::cout << i.x << ' ' << i.y << std::endl;
    }
}
``` -->
