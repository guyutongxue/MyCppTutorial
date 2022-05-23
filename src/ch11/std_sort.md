# `std::sort` 

?> 本文是为了解释 `std::sort` 而撰写的。之后，本文将拆分到本书第十一章的其它部分。

## 前置知识

- 必须熟练使用[数组](/ch04/array/README)、[函数](/ch03/function_definition)。
- 必须熟悉[第四章的指针](/ch04/pointer/pointer)，及其[和数组的关系](/ch04/pointer/pointer_and_array)。
- 建议了解[引用](/ch05/reference)的基本使用。
- 如果你想要在 STL 容器中使用 `std::sort`，建议了解[迭代器](/ch08/stl_containers/iterator_glance)。如果你不知道什么是 STL 容器，则不用管。
- 如果你想要更彻底地搞懂，你需要知道[指向函数的指针](/ch04/pointer/pointer_def_2#指向函数的指针（选读）)、[重载](/ch05/overload)以及[函数模板](/ch08/function_template)。

## STL 算法

正如在[第八章](/ch08/stl_containers/)所提到的，标准库的一部分——STL 中，除了容器、迭代器，还包含了大量算法。STL 算法提供了一些常用的操作，而其中最常用的就是 `std::sort`：对一个区间排序。

## 从冒泡说起

为了引入 `std::sort`，我先展示最基本的排序算法：冒泡排序。

```cpp
int a[100]{};
int n;
// [...] 向 a[0] ~ a[n - 1] 写入元素 
for (int i{0}; i < n - 1; i++) {
    for (int j{0}; j < n - 1 - i; j++) {
        if (a[j + 1] < a[j]) {
            int temp{a[j]};
            a[j] = a[j + 1];
            a[j + 1] = temp;
        }
    }
}
// 现在 a[0] ~ a[n - 1] 是从小到大排序的了
```

如果你不清楚冒泡排序的原理，没有关系：你只需要直到这样的代码可以得到什么样的结果就够了。现在我们首先希望做的事情是将排序部分的代码包装成一个函数。那么观察得到，这个函数应当接受一个数组 `a` 和一个长度 `n` 作为参数，应当返回给调用方一个排序好的数组。

但不幸的是，**数组不能作为函数形参**；此外函数也不能返回数组。但好在**我们有指针**——利用指针可以同时解决这两个问题。

```cpp
// 对 a 所指向元素及其后面共 n 个元素从小到大排序。
void sort(int* a, int n) {
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            // a[j] 就是 *(a + j) 的意思。
            if (a[j + 1] < a[j]) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
```

当用这种写法时，只需传入 `&a[0]` 和 `n`，即可对 `a[0]` 到 `a[n - 1]` 这 `n` 个元素排序。而且由于我们直接修改了指针所指向的变量，从而不需要返回一个新的数组。

```cpp
void sort(int*, int); // 定义见上，略
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]
    sort(&a[0], n);
    // 由于数组到指针的隐式转换，可更方便地写成
    // sort(a, n);
}
```

总之，为了规定这个函数的排序范围，必须传入两个参数：排序范围的起始位置 `a` 以及排序范围的长度 `n`。STL 中 `std::sort` 的设计思路和我们类似。只不过 `std::sort` 用**排序范围的起始位置**和**排序范围的终止位置**两个参数来决定排序范围。模仿这一设计原则，改写我们自己的 `sort` 函数如下：

```cpp
// 对 begin 指向的元素到 end 指向的元素这一区间排序
void sort(int* begin, int* end) {
    int n{end - begin};
    int* a{begin};
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            if (a[j + 1] < a[j]) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
```

在使用时：
```cpp
void sort(int*, int*); // 定义见上，略
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]
    sort(&a[0], &a[n]);
    // 由于数组到指针的隐式转换，可更方便地写成
    // sort(a, a + n);
}
```

特别强调，当这样改写完成后，`end` 指向的元素其实是不被排序的（正如同最初的例子中，`a[n]` 不会被排序：排序的范围是 `a[0]` 到 `a[n - 1]`）。

<img src="/assets/range-begin-end.svg" alt="begin and end iterator">

所以如果你的排序范围是从 `a[1]` 开始的，你应该知道如何用这种写法来达成目标。

## `std::sort` 的基本使用

`std::sort` 定义于头文件 `<algorithm>`，是个函数模板。如果你不知道函数模板是什么的话，那么你可以理解为无限多个函数，你可以从中找到你想要的那个。比如：

```cpp
#include <algorithm>
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    // 调用 std::sort
    std::sort(&a[0], &a[n]);

    // a[0] ~ a[n - 1] 已排好序
}
```

那么，你就调用了形式为
```cpp
void sort(int* begin, int* end);
```

的排序函数。之所以是“无限多个”，因为它可以用来排序 `double` 类型、`char` 类型等所有内置类型构成的数组。

```cpp
#include <algorithm>
int main() {
    double a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    // 也可以在 double 数组上调用 std::sort！
    std::sort(&a[0], &a[n]);

    // a[0] ~ a[n - 1] 已排好序
}
```

如果你了解函数模板，你可能猜到了 `std::sort` 是形如 `template<typename T> void sort(T*, T*);` 的模板；尽管这并不准确，但意思对了。

## 排序依据

假设 `std::sort` 用的就是我们刚刚写的冒泡排序的实现。（真实情况当然不是。）当 `sort` 执行完成时，最终排出来的就是从小到大的有序范围。仔细观察我们的代码：

```cpp
void sort(int* begin, int* end) {
    int n{end - begin};
    int* a{begin};
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            // 注意下面一行的小于号。
            // 只有这一行表达式计算元素之间的大小关系，
            // 然后依靠这个关系来交换元素的顺序。
            if (a[j + 1] < a[j]) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
```

只有 `a[j + 1] < a[j]` 这一行表达式是用来断定元素大小的。也就是说，如果你把这一行改成 `a[j + 1] > a[j]`，那么最终排序出来的范围应当就是从大到小的。

```cpp
// 冒泡的 sort，但从大到小
void sort(int* begin, int* end) {
    int n{end - begin};
    int* a{begin};
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            if (a[j + 1] > a[j]) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
```

标准库的 `std::sort` 当然希望能够照顾所有的需求：既可以从小到大排，又可以从大到小排。注意到我们的实现中，从小到大和从大到小只取决于 `if` 的条件。为了实现更通用的 `sort`，我可以把这个条件抽取成为一个独立的函数……然后在 `sort` 里调用它。

```cpp
bool cmp(int a, int b) {
    return a < b;  // 或 return a > b; 若从大到小排
}

void sort(int* begin, int* end) {
    int n{end - begin};
    int* a{begin};
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            if (cmp(a[j + 1], a[j])) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
```

想一想这样做的好处是什么？这意味着如果我们想更改 `sort` 的排序方式，我们不再需要更改 `sort` 的实现，而只需要更改 `cmp` 函数的实现就可以了。这样，`sort` 就变成了一个“通用”的排序方案。

更进一步，可以将这个比较函数 `cmp` 作为 `sort` 第三参数。这样，我们在比较的时候可以传入一个函数作为参数来决定排序结果是从小到大还是从大到小。

```cpp
void sort(int* begin, int* end, /* ??? */ cmp) {
    int n{end - begin};
    for (int i{0}; i < n - 1; i++) {
        for (int j{0}; j < n - 1 - i; j++) {
            if (cmp(a, b)) {
                int temp{a[j]};
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
}
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    sort(&a[0], &a[n], /* 一个返回 a < b 的函数 */);

    // a[0] ~ a[n - 1] 已排好序
}
```

但当头一棒的问题是函数不能作为函数的参数（如果仔细阅读函数章节的注意事项的同学可能知道这一点）。——但 `std::sort` 通过模板的一些手段成功让“函数”成为了 `std::sort` 的参数。

```cpp
#include <algorithm>
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    std::sort(&a[0], &a[n], /* 一个返回 a > b 的函数 */);

    // a[0] ~ a[n - 1] 已从大到小排好序
}
```

当你不提供这个第三参数时，`std::sort` 会选择名为 `std::less{}` 的“函数”——它会返回 `a < b` 的结果。

### 如何提供第三参数

最显而易见的方法是自己写一个 `cmp` 函数，然后将 `cmp` 这个名字作为 `std::sort` 的第三参数。

```cpp
#include <algorithm>
bool cmp(int a, int b) {
    return a > b;
}
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    std::sort(&a[0], &a[n], cmp);

    // a[0] ~ a[n - 1] 已从大到小排好序
}
```

看上去很不错，但实际背后有一些细节问题。

> 当 `cmp` 不作为函数调用运算符的左操作数时，它必然发生隐式转换：转换到指向自身的函数指针。因此在这里，`cmp` 其实是 `bool(*)(int, int)` 类型的函数指针。从而，`std::sort` 能够接受一个指针作为参数。你以为你传入了函数，“打破了”之前所说“函数不能所以函数作为参数”的规则，其实不是这样的：你传入了一个指针进去。

我个人更推荐的写法是所谓“Lambda 表达式”：即一个临时的“函数”。

```cpp
#include <algorithm>
int main() {
    int a[100]{};
    int n;
    // [...] 输入 a[0] ~ a[n - 1]

    std::sort(&a[0], &a[n], [](int a, int b){ return a > b; });

    // a[0] ~ a[n - 1] 已从大到小排好序
}
```

这里，`[](int a, int b){ return a > b; }` 是一个临时的、没有名字的“函数”。或者，你可以将它理解为函数类型的字面量。它接受两个 `int` 类型参数 `a` `b`，然后返回 `a > b` 的值。

> Lambda 表达式不是函数。它其实是一个对象（也就是变量），所以这也不会惹上“函数不能用函数作为参数”的麻烦。`std::less{}` 是同样的道理。

## 结构体的排序

```cpp
#include <algorithm>
struct S {
    int x, y;
};
int main() {
    S a[100]{};
    int n;
    // [...]
    std::sort(&a[0], &a[n]); // 编译错误！
}
```

想当然地这样写是不对的。因为我们刚才提到了，如果你不提供 `std::sort` 的第三参数，那么它默认的第三参数——`std::less{}` 会尝试 `a < b` 表达式的结果作为排序依据。但我们的结构体 `S` 是无法用 `<` 运算符比较的：
```cpp
struct S {
    int x, y;
};
int main() {
    S a, b;
    a < b; // 编译错误
}
```

那么为了解决结构体的排序问题，就衍生出两种解决办法。

第一种解决办法是手动给出用作比较的第三参数。下面的例子中使用了 Lambda 表达式：

```cpp
#include <algorithm>
struct S {
    int x, y;
};
int main() {
    S a[100]{};
    int n;
    // [...]
    std::sort(&a[0], &a[n], [](S a, S b) {
        return a.x < b.x;
    });
}
```

这样，`a[0]` 到 `a[n - 1]` 就会按照 `x` 成员从小到大排序。你还可以编写更复杂的判断规则：


```cpp
#include <algorithm>
struct S {
    int x, y;
};
int main() {
    S a[100]{};
    int n;
    // [...]
    std::sort(&a[0], &a[n], [](S a, S b) {
        if (a.x == b.x) return a.y < b.y;
        else return a.x < b.x;
    });
}
```

### 警告：善用引用

对于 `std::string` 等类型，复制 `std::string` 的开销非常大。如果你要编写自己的排序规定函数，那么请**务必使用引用传参**：

```cpp
#include <algorithm>
#include <string>
int main() {
    std::string a[100]{};
    int n;
    // [...]
    std::sort(&a[0], &a[n], [](const std::string& a, const std::string& b) {
        return a.length() < b.length();
    });
}
```

第二种解决思路是手动提供 `S` 的 `<` 运算符定义，然后让 `std::sort` 的默认第三参数选择它。如果你阅读过[第六章的运算符重载](/ch06/)，那么你可以很轻松地写出下面的正确代码：

```cpp
#include <algorithm>
struct S {
    int x, y;
    bool operator<(const S& b) const {
        return x < b.x;
    }
};
int main() {
    S a[100]{};
    int n;
    // [...]
    std::sort(&a[0], &a[n]); // 使用 < 运算符来排序
}
```

### 二维数组？

类似地，不能直接对二维数组做 `std::sort`。原因是：二维数组的 `&a[0]` `&a[n]` 是指向一维数组的指针——换而言之，被排序的对象是一个个的一维数组。那么一维数组是不能用 `<` 比较的（它连赋值都不行，你还指望什么！）。即便你自己提供了作为排序依据的第三参数也是不够的：`std::sort` 内部在交换元素时会用到复制赋值与复制初始化，而这两件事恰好都是数组无法做到的。所以对不起，二维数组无法用 `std::sort` 排序。

## STL 容器

如果你使用 STL 容器，你应当知道在 STL 容器中是用“迭代器”这一概念来对应数组中指针的概念的。所以，本应传入指针的 `std::sort` 的第一、二参数，在 STL 容器中应当使用对应的迭代器。

```cpp
#include <vector>
#include <algorithm>
int main() {
    std::vector<int> a;
    // [...]
    std::sort(a.begin(), a.end() /* 可选的第三参数 */);
}
```
