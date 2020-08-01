# 数组的定义和初始化

## 数组的大小

首先来看一段代码：
```CPP
#include <iostream>
using namespace std;
int main() {
    int n{5};
    int a[n]{};
    for (int i{0}; i < 5; i++) {
        cout << a[i] << endl;
    }
}
```
请问这段代码有问题吗？

答案是有的。因为 `n` 是一个变量但不是常量，所以它不能用作数组 `a` 的长度。（如果读者对此感到困惑：明明 `n` 初始化为 5 了啊，它的值应该能确定啊？事实上不是这样的，变量的初始化在运行时才会执行，而数组的大小要求在编译期间就能得到。编译器没办法“提前感知”这个大小。）所以如果编译器足够严格的话，会报下列错误：
```io
prog.cpp: In function 'int main()':
prog.cpp:5:9: error: ISO C++ forbids variable length array 'a' [-Wvla]
    5 |     int a[n]{};
      |         ^
```
那么这样呢？
```CPP
#include <iostream>
using namespace std;
int main() {
    int n{5};
    const int m{n};
    int a[m]{};
    for (int i{0}; i < 5; i++) {
        cout << a[i] << endl;
    }
}
```
这样也是不行的。因为变量 `m` 仅仅是[只读变量](/ch02/part1/readonly_variable.md)，但它不是常量（非常量初始化）。所以我们也不能这样写。

正确的做法是使用常量作为数组大小。最简单的做法是只用字面量——
```cpp
int a[5]{};
```
但是这样的话会有一些小麻烦。在某些场合中，我们可能声明并定义了一堆相同长度的数组：
```cpp
int a[5]{};
int b[5]{};
int c[5]{};
// [...]
```
这个时候若想同时修改它们的长度，就需要进行多次改动。如果用 `constexpr` 变量来作为数组长度：
```cpp
constexpr int N{5};
int a[N]{};
int b[N]{};
int c[N]{};
// [...]
```
则只需修改一次 `N` 的值就能实现批量修改数组大小。回到最初的代码，下面是我推荐的写法：
```CPP
#include <iostream>
using namespace std;
int main() {
    constexpr int N{5};
    int a[N]{};
    for (int i{0}; i < 5; i++) {
        cout << a[i] << endl;
    }
}
```

> C++ 对数组大小是常量有着严格的限制，但是 C 语言没有这样的要求。因此许多编译器也允许那些不标准的用法。如果你使用 GCC 编译器的话，我建议将 `-pedantic` 或 `-pedantic-errors` （可理解为严格模式）开关启用以防止这种错误的用法。

除此之外，很显然地，数组的大小必须是正数（意味着不存在拥有零个元素的数组）。

> C++ 要求数组的大小求值后可隐式转换为 `std::size_t` 类型。在某些编译器下，这个类型与 `unsigned int` 等价。

## 初始化器



## 连续声明