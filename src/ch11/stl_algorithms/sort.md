# 排序

首先介绍刚刚提到的排序算法，`sort`。它是最常用的 STL 算法之一，使用起来也很方便：

```CPP
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

```CPP
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
> ```CPP
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

```CPP
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

```CPP
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

```CPP
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

```CPP
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
```
