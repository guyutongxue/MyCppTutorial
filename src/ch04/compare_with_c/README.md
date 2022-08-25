# 迁移到 C 语言 <Badge type="tip" text="选读" />

事实上，我们目前所学的内容仍不超出 C 语言的范畴。所以，我们只需通过适当的改写，就能够将 C++ 程序改写为 C 程序。这一节我们先列出一些必要的不同：

## 头文件不同

在 C 中，头文件都是 `.h` 结尾的，而且和 C++ 头文件大有区别。比如，C 中不存在 `iostream` 头文件（以及里面定义的 `cin` 和 `cout`），你需要用 `stdio.h` 中的函数来实现输入输出（参见[后续](/ch04/compare_with_c/c_io.md)内容）。

## 没有命名空间

C 中不存在命名空间的概念，所以你不需要写 `using namespace std;`。

## 初始化

C 语言中的初始化需要写成复制初始化的形式，即 `=` 后接初始化值。比如 C++ 中
```cpp
int a{42};
int b[5]{1, 2, 3, 4, 5};
```
需要写成
```c
int a = 42;
int b[5] = {1, 2, 3, 4, 5};
```
复制初始化也是合法的 C++ 语法。但是我们前期为了强调初始化和赋值的区别，所以没有使用带有 `=` 的复制初始化语法。在十分明确赋值和初始化的区别后，由于非列表的复制初始化写起来更方便，我在本书中也将偶尔使用。

## 其它

`new` 和 `delete` 是 C++ 独有的语法，在 C 中需要用对应的这样两个函数实现：
```c
void* malloc(size_t n); /* 分配 n 个字节空间，并将首地址返回 */
void free(void* p);     /* 将 p 所指向的空间释放 */
```
用 `using` 关键字引入类型别名是 C++ 独有的语法，在 C 中需要用 typedef 实现。比如
```cpp
using Array = int[10];
```
在 C 中需比较别扭地写作
```c
typedef int Array[10];
```

C 中没有带作用域的枚举，也不可以指定枚举的基。

除此外还有一些细节上的问题，我们会在稍后章节说明。

## 例子

这样的 C++ 程序：
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    int a{0}, b{0};
    cin >> a >> b;
    cout << a + b << endl;
}
```
你需要改写成这样：
```c codemo
#include <stdio.h>
int main(void) {
    int a = 0, b = 0;
    scanf("%d%d", &a, &b);
    printf("%d", a + b);
    return 0;
}
```

这里 `scanf` 和 `printf` 就是没有 `cin` 和 `cout` 时，C 的输入输出。下一节将重点讲解它们。
