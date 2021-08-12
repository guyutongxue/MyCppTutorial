# 预处理指令

预处理指令又称预编译指令，是在 C++ 源文件编译前执行的指令。预处理指令可以定义或取消定义宏、条件编译、包含文件、引发错误、设置编译器等等。预处理指令永远以 `#` 开头，且以换行符为结尾。下面将分别介绍这些预处理指令。

## 宏（ `#define` `#undef` ）

<h6 id="idx_宏"></h6>

宏使用 `#define` 定义。它大致有三种用法。

### 定义可供替换的宏

```sdsc
#define *宏名* *替换文本*
```

此条指令将源代码中出现的所有 `@*宏名*@` 替换为 `@*替换文本*@` 。请注意这里的 `@*宏名*@` 是经过词法分析的，即当一个“单词”与 `@*宏名*@` 相符时进行替换。比如：
```cpp
#define MAX_N 10000
```

相当于把 `MAX_N` 这个词在编译前替换为 `10000` ：

```cpp
int a[MAX_N]{}; // 替换为 int a[10000]{};
int MAX_NUMBER;    // 不进行替换
```

### 定义宏，但不进行替换

```sdsc
#define *宏名*
```

此条指令仅仅定义了一个宏，但它不能用于替换。它主要可以用于条件编译（参见下文）。比如：
```cpp
#define ONLINE_JUDGE
```

### 定义可供替换的类函数宏

你可以定义一个类似函数一样的宏。即：
```sdsc
#define *宏名*(*形参列表*) *带形参的替换文本*
```

你可以在 `@*宏名*@` 后面附上 `@*形参列表*@` ，这样你可以像函数那样使用这个宏。替换的时候，会用你的实参去替换替换文本的形参。替换举几个例子的话：
```cpp
#define PRINT(sth) cout << sth << endl
PRINT("Hello");    // 替换为 cout << "Hello" << endl;
PRINT(42);         // 替换为 cout << 42 << endl;
```

又如：
```cpp
#define SUM(a, b) ((a) + (b))
int score = SUM(23, 42); // 替换为 int score = ((23) + (42));
```

形参列表可以不限定长度，使用省略号即可：
```sdsc
#define *宏名*(*形参列表*, ...) *带形参的替换文本*
#define *宏名*(...) *带形参的替换文本*
```

你可以使用 `__VA_ARGS__` 这个标识符来指代省略号所省略的内容（可以为空）。比如：
```cpp
#define INT_ARRAY(name, len, ...) int name[len]{ __VA_ARGS__ }
INT_ARRAY(bar, 10, 3, 4, 5, 6); // 替换为 int bar[10]{ 3, 4, 5, 6 };
```

注意：仿函数宏的实参只识别 `(` `)`，而不识别 `<` `>`。这意味着将模板实参作为宏实参可能会被错误地替换。
```cpp
#define F(a, b) /* ... */
F(std::pair<int, int>, int); // 错误：参数个数不匹配
                             // a 替换为 std::pair<int
                             // b 替换为 int>
                             // 出现多余的实参 int
```

### `#` 运算符

```sdsc
#*宏形参*
```

在宏替换中， `#` 运算符可以将这个形参的文本**用双引号引起**，使之成为一个字符串字面量。举例来说：

```cpp
#define PRINT1(a) cout << a << endl
#define PRINT2(a) cout << #a << endl
PRINT1(number);   // 替换为 cout << number << endl;
PRINT2(number);   // 替换为 cout << "number" << endl;
PRINT2("Hello");  // 替换为 cout << "\"Hello\"" << endl;
```

### `##` 运算符

```sdsc
*左侧文本或形参*##*右侧文本或形参*
```

`##` 可以将文本和形参**紧密地、无空格地粘贴**在一起。这一运算符可以用于：形成更长的变量名、组成更多位数的算术类型字面量、组合为复合赋值运算符等。但不能用于创建注释。例如：

```cpp
#define STICK(a, b) (a##b)
int x = STICK(123, 456) // 替换为 int x = (123456);
```

### `__VA_OPT__` 运算符

```sdsc
__VA_OPT__(*文本*)
```

当使用 `__VA_ARGS__` 时，允许在替换文本中出现 `__VA_OPT__` 运算符。该运算符的含义是，如果 `__VA_ARGS__` 为空字符串，则在最终替换结果中删去 `@*文本*@`，否则在最终替换结果中保留 `@*文本*@`。例如：
```cpp
#define G(...) f(0 __VA_OPT__(,) __VA_ARGS__)
G(1, 2); // 替换为 f(0, 1, 2);
G();     // 替换为 f(0); ，注意没有多余的逗号
```

除了 `__VA_OPT__` 运算符，还有一种扩展语法：当替换文本中出现 `,##__VA_ARGS__` 时，则在 `__VA_ARGS__` 为空字符串时删去开头的逗号。尽管大多数编译器都启用此扩展，但它并不标准。
 
### 一些编译器预定义的宏

| 宏名 | 含义 |
| --- | --- |
| `__cplusplus` | 代表所用的 C++ 标准版本，定义为值 `199711L` (C++98)、`201103L` (C++11)、`201402L` (C++14)、 `201703L` (C++17) 或 `202002L`（C++20）。 |
| `__FILE__` | 定义为当前源文件名。 |
| `__LINE__` | 定义为当前源文件行号 |
| `__DATE__` | 定义为编译日期，形式为 "Mmm dd yyyy" 的字符串字面量。 |
| `__TIME__` | 定义为时间，形式为 "hh:mm:ss" 的字符串字面量。 |

 
你可以随时通过 `#undef` 来取消某个宏定义。

```sdsc
#undef *宏名*
```
 
## 条件编译（ `#if` `#elif` `#else` `#endif` `#ifdef` `#ifndef` ）
条件编译是指编译器选择性地编译某一部分而不编译其它部分。

```sdsc
#if *常量表达式*
*代码1*
<opt-block>#else
*代码2*</opt-block>
#endif
```

若常量表达式为非 `0` 值，则编译 `@*代码1*@` 但不编译 `@*代码2*@` ；反之若常量表达式为 `0` 值，则编译 `@*代码2*@` 但不编译 `@*代码1*@` 。当然， `#else` 即 `@*代码2*@` 是可以省略的。例如：

```cpp
#if __cplusplus >= 201103L
int* ptr = nullptr;
#else
int* ptr = NULL;
#endif
```
如果连续多个 `#else #if` ，可以使用 `#elif` 来简化。
 
### `defined` 运算符
`defined` 运算符可以返回当前环境是否定义了某个宏。

```sdsc
defined *宏名*
defined (*宏名*)
```

若宏存在，则值为 `1` ；若宏不存在，则值为 `0` 。比如：

```cpp
#if defined(ONLINE_JUDGE)    // 若ONLINE_JUDGE宏被定义
freopen("1.out","w",stdout); // 则重定向到文件输出
#endif
```
另外， `#ifdef` 等价于 `#if defined` ， `#ifndef` 等价于 `#if !defined` 。它们的用法是：

```sdsc
#ifdef *宏名*
#ifndef *宏名*
```
 
## 包含文件（ `#include` ）
`#include` 指令可以把某个源文件直接插入进指令所在的位置。当文件编译时，将不断递归地展开 `#include` 指令，直至不存在`#include` 指令。其语法如下：

```sdsc
#include &lt;*头文件名*&gt;
#include &quot;*文件名*&quot;
```

其中，用尖括号（ `<>` ）包括的文件名将优先在系统库文件中查找，而用引号引起的文件名将优先在当前源文件所在的路径中查找。
我们经常使用的  `<iostream>` `<cmath>` `<iomanip>` 等库，都是位于系统库路径的名为`iostream` `cmath` 和 `iomanip` 的文件，其中声明（或定义）了常用的变量、函数或者其他对象：比如 `cin` `cout`  `sqrt` 和 `setw` 等等。在一些文本编辑器中，你可以按下 <kbd>Ctrl</kbd> 键的同时点击 `#include` 指令，就可以查看这些头文件。
 
## 引发错误（ `#error` ）

你可以手动地引发一个编译错误，通过这样的语法：
```sdsc
#error *错误信息*
```
但凡编译到此指令编译器将停止编译，并将错误信息输出。
 
## 设置编译器（ `#pragma` `#line` ）

```sdsc
#pragma *某些参数*
```
你可以通过某些参数去修改编译器的行为（比如静态链接等）。具体的参数语法和形式各有不同，可以参照编译器的说明文档。

常见的通用语法有 `#pragma once` 和 `#pragma pack`。

`#pragama once` 指定这个文件只能被 `#include` 一次，也就是说等价于
```cpp
#ifndef LIBRARY_FILENAME_H
#define LIBRARY_FILENAME_H

// [...] 文件内容

#endif // LIBRARY_FILENAME_H
```

`#pragma pack` 指定接下来定义的结构体的对齐。
```sdsc
#pragma pack(*对齐*)
#pragma pack()
```
`#pragma pack` 可接受一个参数 `@*对齐*@`，它需要是 2 的整数次幂。当写下这条预处理指令后，之后的结构体对齐皆设置为 `@*对齐*@`。`#pragma pack()` 取消此设置，恢复默认对齐。比如：
```CPP
#include <iostream>
using namespace std;
#pragma pack(2)
struct X {
    int32_t n;
    int32_t m;
    int16_t c;
};
#pragma pack()
int main() {
    cout << sizeof(X) << endl; // 10
}
```

但是，如果你使用 GCC 或 Clang，我们更推荐用特性（Attribute）来实现：
```CPP
#include <iostream>
#include <tuple>
using namespace std;
struct [[using gnu: packed, aligned(2)]] X {
    int32_t n;
    int32_t m;
    int16_t c;
};
int main() {
    cout << sizeof(X) << endl; // 10
}
```

`#line` 用于覆盖设置当前的行号或者当前的文件名。此语法一般用于机器生成的代码。

```sdsc
#line *行号*
#line *行号*&quot;*文件名*&quot;
```
