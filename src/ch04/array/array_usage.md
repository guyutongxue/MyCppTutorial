# 数组的用途

本节介绍数组的简单用途。我们之前已经略微提及了数组[用于统计](/ch02/part1/array_glance.md#简单应用)的写法，这里用一道例题作为复习：

## 用于统计

某所大学有 1000 位教师，分布在 20 个不同的学院（编号 1 ～ 20）中，每个学院最多有 12 个系（编号 1 ～ 12 ）。每位教师都属于唯一的一个系。现在请你编写一个程序，输入每位教师所在院、系的编号，输出每个系教师的数量。

下面直接给出参考解答：

```cpp codemo(show)
#include <iostream>
using namespace std;
int main() {
    int teacher[21][13]{};
    for (int i{0}; i < 1000; i++) {
        int school, dept;
        cin >> school >> dept;
        teacher[school][dept]++;
    }
    for (int i{1}; i <= 20; i++) {
        for (int j{1}; j <= 12; j++) {
            cout << "School No. " << i << "Dept. No." << j << ": ";
            cout << teacher[i][j] << endl;
        }
    }
}
```

其中 `teacher[i][j]` 表示编号 i 的学院中，编号 j 那个系内教师的数量。第 7 ～ 8 行进行了输入并统计的操作，第 10 行开始的是输出。如果你还不能很好地理解它，可以参考[之前的那道例题](/ch02/part1/array_glance.md#简单应用)，那里有更详细的解答。

## 用于标记

我们在函数章节见过了[输出质数](/ch03/recursion.md#从普通调用说起)这样的题目。当时的思路是从定义出发，一个一个判断。现在我们换一种更高效的思路——埃拉托斯特尼筛法。

艾拉托斯特尼筛法是这样想的：如果想求哪些数是质数，只需要把所有的合数都排除掉，剩下的（大于 1 的）就都是质数了。那么怎样把合数剔除呢？首先，在 $1\sim n$ 的范围内，2 的倍数除了 2 以外都是合数，3 的倍数除了 3 以外都是合数，4 的倍数……这样一直做到 $\sqrt{n}$ 的倍数，就可以把所有的合数都选出来。

现在假设我们要找到 100 以内的质数。我们用一个布尔类型构成的数组 `isComposite` 来进行筛选，`isComposite[i]` 表示数 `i` 是否为合数。因为接下来的工作是把所有的合数都找出来，因此在最初我们假设所有的数都是质数，即全部为 `false` （这也是上述代码采用零初始化的原因）。如果找到了一个合数 `i` 就令 `isComposite[i] = true;` 即可。
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    bool isComposite[101]{};
    // [...]
}
```

下一步开始寻找合数。把一个数 `i` 的 2 倍、3 倍……这些范围内的倍数全部设为合数。
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    bool isComposite[101]{};
    // [...]
        int j{i * 2};              // 令 j 为 i 的两倍
        while (j <= 100) {         // 当不超过范围时
            isComposite[j] = true; // 标记 j 为合数
            j += i;                // 令 j 为 i 的下一个倍数
        }
    // [...]
}
```

然后，对所有 $1\sim \sqrt{100}$ 内的 `i` 都进行这样的操作，就能标记上所有的合数。
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    bool isComposite[101]{};
    for (int i{2}; i <= 10; i++) {
        int j{i * 2};              // 令 j 为 i 的两倍
        while (j <= 100) {         // 当不超过范围时
            isComposite[j] = true; // 标记 j 为合数
            j += i;                // 令 j 为 i 的下一个倍数
        }
    }
    // [...]
}
```

最后，输出质数。只有 `isComposite[i]` 为 `false` 的 `i` 才是质数，所以完整的代码就出来了。你可以自行验证输出结果的正确性。
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    bool isComposite[101]{};
    for (int i{2}; i <= 10; i++) {
        int j{i * 2};              // 令 j 为 i 的两倍
        while (j <= 100) {         // 当不超过范围时
            isComposite[j] = true; // 标记 j 为合数
            j += i;                // 令 j 为 i 的下一个倍数
        }
    }
    for (int i{2}; i <= 100; i++) {
        if (!isComposite[i]) {
            cout << i << " ";
        }
    }
}
```
这里，数组 `isComposite` 起到了标记的作用。它在程序的运行过程中，对数 `i` 打上了“是否为合数”这样的标记，最终遍历它们就得到了哪些是质数、哪些是合数。

这个程序还可以做一点优化。考虑一个合数的任意倍数永远是合数，比如 4 的倍数 8、12、16 必然是合数；但是当我们为 4 的倍数打上合数标记之前，这些倍数显然已经被标记过了：因为它们都含有和 4 相同的因子（即同时都是 2 的倍数，已经被标记过），所以无需再次标记。因此我们只需要标记一个质数的倍数就够了。那么代码就写成这样。
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    bool isComposite[101]{};
    for (int i{2}; i <= 10; i++) {
        if (isComposite[i]) continue; // 如果 i 是合数，就可以直接跳过
        int j{i * 2};              // 令 j 为 i 的两倍
        while (j <= 100) {         // 当不超过范围时
            isComposite[j] = true; // 标记 j 为合数
            j += i;                // 令 j 为 i 的下一个倍数
        }
    }
    for (int i{2}; i <= 100; i++) {
        if (!isComposite[i]) {
            cout << i << " ";
        }
    }
}
```

## 注意事项

数组有许多用途，但也有许多限制。这里再次强调，数组不能被赋值。比如：
```cpp
int a[5]{1, 2, 3, 4, 5};
int b[5]{};
b = a; // 错误：数组不能被赋值
```
那么如何解决呢？目前你只能逐个元素赋值：
```cpp
int a[5]{1, 2, 3, 4, 5};
int b[5]{};
for (int i{0}; i < 5; i++) {
    b[i] = a[i];
}
```
