# 指针的定义 Ⅱ

上一节提到了一种指针拥有“指向 `int[5]` 的指针类型”。这种指针类型还出现在下面的代码中：
```cpp
int a[4][5]{};
cout << a << endl;
```
这时，`a` 是一个二维数组，即由 4 个 `int[5]` 构成的数组。当它被输出时，会隐式转换成指向首元素 `a[0]` 的指针。然而首元素 `a[0]` 是 `int[5]` 类型的数组，所以这时输出的也是一个指向 `int[5]` 的指针。由此也能看出指向数组的指针也经常出现，但是我们却不会声明并定义这样的指针……
```
int[5]* p; // 不对，没有这样的语法
int* p[5]; // 这是由 5 个 int* 类型构成的数组
```
所以接下来我们来学习如何声明并定义指向数组的指针。

## 指向数组的指针

正确的写法是：
```cpp
int (*p)[5]{nullptr};
```
是不是看上去特别诡异。后面的 `{nullptr}` 是初始化器，如果不带初始化器就声明成 `int (*p)[5];`。你问为什么这么古怪？别问，问就是历史遗留。所以当你把二维数组作为函数形参的时候，它实际上是把指向数组的指针作为了形参：
```CPP
#include <iostream>
using namespace std;
void f(int(*)[5]);
int main() {
    int a[4][5]{};
    f(a);
}
void f(int (*p)[5]) {
    cout << sizeof(*p) << endl;
}
```
其中 `int(*)[5]` 就是这个该死的指针的类型标识。这个括号是不能省的，一旦省略就变成由 5 个 `int*` 构成的数组了，而非一个指针。

<h6 id="idx_类型别名"></h6>

我很不喜欢这种声明语句，所以这里介绍一个方法：使用**类型别名**（Type alias）。声明类型别名的语法是这样的：
```sdsc-legacy
using *别名* = *类型标识*;
```
比如
```cpp
using ArrayOf5Int = int[5];
```
这时，`ArrayOf5Int` 就完全等价于 `int[5]` 这个类型了。比如：
```cpp
ArrayOf5Int b{};
```
就声明了一个数组 `b`，它拥有 5 个 `int` 元素。类似地，我们可以很优雅地声明指向数组的指针：
```cpp
ArrayOf5Int* p{nullptr};
```
看上去就正常不少。使用类型别名后，刚刚的代码可以改写成：
```CPP
#include <iostream>
using namespace std;
using ArrayOf5Int = int[5];
void f(ArrayOf5Int*);
int main() {
    ArrayOf5Int a[4]{}; // 等价于 int a[4][5]{};
    f(a);
}
void f(ArrayOf5Int* p) {
    cout << sizeof(*p) << endl;
}
```

## 指针的只读性

在 C++ 中，只读变量和非只读变量拥有不同的类型（即 `const int` 和 `int` 是两个类型）。所以有
```cpp
int* p{nullptr};       // p 拥有指向 int 的指针类型
const int* q{nullptr}; // q 拥有指向 const int 的指针类型
```
但是请注意，指针 `q` 本身不是只读的。它只是指向只读变量而已：
```CPP
#include <iostream>
using namespace std;
int main() {
    const int a{42};
    const int* p{&a};
    *p = 56;     // 错误，*p 是 const int 类型，只读的
    p = nullptr; // OK, p 不是只读的，可以被赋值
}
```

如果要声明一个只读的指针，需要把 `const` 放在 `*` 的右边。
```cpp
int a;
int* const p{&a}; // p 是指向 int 的只读指针
```
这时，`*p` 是 `int` 类型可以更改，但是 `p` 只读不能更改——也就是说，`p` 自始至终只能指向一个确定的变量。
```CPP
#include <iostream>
using namespace std;
int main() {
    int a{42};
    int* const p{&a};
    *p = 56;     // OK，*p 是 int 类型
    p = nullptr; // 错误, p 是只读的
}
```

如果你看不惯的话，你也可以用类型别名。
```cpp
int a;
using PtrToInt = int*;
const PtrToInt p{&a}; // 只读指针 int* const
```

## 指向 `void` 的指针

存在一种特殊类型的指针，称为指向 `void` 的指针：
```cpp
void* p{nullptr};
```
你可以将 `void*` 理解为指向**任意类型**的指针类型。因为任何指针都可以隐式转换到 `void*` 类型，即 `void*` 是一个通用的指针类型。

但是，对 `void*` 类型做算术运算和解地址运算是未定义的。所以就目前而言，它的用途比较小；常见的只有：
```cpp
void printPtr(void* p) {
    cout << p << endl;
}
```
通过这个函数，可以输出 `char*` 指针的值（而非输出字符串）。这是因为发生了从 `char*` 到 `void*` 的转换。
```cpp
char a{};
char* p{&a};
printPtr(p);
```
当然你也可以直接进行强制类型转换：`cout << (void*)p << endl;`。

## 指向函数的指针

<h6 id="idx_函数指针"></h6>

之前讨论的一直是指向变量的指针。实际上，C/C++ 还提供了指向函数的指针，俗称为**函数指针**。它的声明如下：
```sdsc-legacy
*返回值类型* (&#42;*指针名*)(**参数列表**)**初始化器**;
```
比如：
```cpp
int (*ptr)(int, int){nullptr};
```
它是一个基类型为函数的指针。其中这个函数必须接收 `@参数列表@` 所规定的数量、类型的参数，且返回值类型为 `@返回值类型@`。比如上面示例中的函数指针 `ptr`，它可以：
```cpp
int (*ptr)(int, int){nullptr};
int max(int, int);
int main() {
    ptr = &max; // ptr 存储了函数 max 的地址，即指向 max
}
```
你可以通过函数指针的解地址运算符来调用其所指向的函数：
```cpp
int (*ptr)(int, int){&max};
(*ptr)(3, 5); // 调用了 max 函数
```

除此之外，C/C++ 提供了一些“快捷方式”：
1. 所有的函数都可以隐式转换到指向自身的指针；
2. 函数指针可以不经过解地址运算符，直接调用其所指向的函数。

具体说就是：
```CPP
int (*ptr)(int, int){nullptr};
int max(int a, int b) {
    return a > b ? a : b;
}
int main() {
    ptr = &max;   // 正常的赋值
    ptr = max;    // 亦可：max 先隐式转换为 &max，随后赋值

    (*ptr)(3, 5); // 先解地址，然后调用
    ptr(3, 5);    // 亦可：允许不解地址，直接调用其所指向的函数
}
```
