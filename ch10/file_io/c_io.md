# C 风格输入输出（选读）

为兼容 C 语言，C++ 仍然提供了 C 风格的输入输出库。但如无特殊情形，**总是建议使用 C++ 风格的流式输入输出**。

## `std::FILE`

虽然 C 语言没有面向对象的语法，但你仍然可以写出面向对象风格的代码。C 风格输入输出就是这样的一个例子。它的基础是结构体 `std::FILE`（在 C 语言中，是 `FILE`；下简称 `FILE`）。

`FILE` 类似于 `std::*fstream`，包含了关于文件读写的所有信息。但我们并不清楚 `FILE` 的布局；我们甚至看不到 `FILE` 的定义。但这无妨，在使用 `FILE` 的过程中并不会用到 `FILE` 类型，而是指向 `FILE` 的指针。

首先，使用 `std::fopen` （在 C 中是 `fopen`，下类似不再赘述）函数来创建一个 `FILE` 对象。它会返回一个 `FILE*` 供你使用。`fopen` 的声明是：
```cpp
FILE* fopen(const char* filename, const char* mode);
```

> 在 C99 中，filename 和 mode 具有 restrict 限定。

其中，`filename` 是存储打开文件名的 C 风格字符串，`mode` 是 `"r"` 或 `"w"` 或 `"rb"` `"wb"` 等，指示打开文件的方式是“读”还是“写”，是否是二进制模式。比如：

```cpp
#include <cstdio> // C 风格 IO 库
                  // C 中为 <stdio.h>
int main() {
    // 以读取模式打开文件 "a.txt"
    FILE* fp = std::fopen("a.txt", "r");
    // 随后，操作 fp 以读取其内容...
}
```

当持有了指向 `FILE` 的指针后，就可以开始读文件或写文件了。

## 格式化读写

还是从格式化读写说起。类似 `scanf`，使用 `fscanf` 格式化地读。特别地，第一参数是 `FILE*`，指示从哪个文件格式化读取：

```cpp
#include <cstdio>
int main() {
    // 以读取模式打开文件 "a.txt"
    FILE* fp = std::fopen("a.txt", "r");
    
    int a, b, c;
    // 从 a.txt 中读取三个空白字符分隔的整数
    std::fscanf(fp, "%d%d%d", &a, &b, &c);
    // [...]
}
```

所有的占位符规定（如 `%d` `%c` `%s`）都和 `scanf` 相同。

类似 `printf`，使用 `fprintf` 格式化地写。同样第一参数是 `FILE*`。

```cpp
#include <cstdio>
int main() {
    // 以写入模式打开文件 "b.txt"
    FILE* fp = std::fopen("b.txt", "w");
    
    int a = 42, b = 56, c = 71;
    // 写入 a b c 三个整数到 b.txt
    std::fscanf(fp, "%d %d %d\n", a, b, c);
    // [...]
}
```

所有的占位符规定都和 `printf` 相同。

## 无格式化读写

函数 `fread` 和 `fwrite` 实现无格式化的读写。

```cpp
char* fread(void* buffer, unsigned size, unsigned count, std::FILE* stream);
char* fwrite(const void* buffer, unsigned size, unsigned count, std::FILE* stream);
```

`fread` 向 `stream` 从指代的文件读取 `size * count` 个字节，并存储到 `buffer` 所指向的位置上。

```cpp
#include <cstdio>
int main() {
    FILE* fp = std::fopen("a.bin", "r");
    
    // 从 fp 读取 sizeof(int) 个字节，
    // 将内容读到 a 的存储空间
    int a;
    std::fread(&a, sizeof(a), 1, fp);

    // 类似，但读取到 b[0] b[1] b[2]
    int b[3];
    std::fread(&b, sizeof(int), 3, fp);

    // [...]
}
```

`fwrite` 将 `buffer` 地址开始的 `size * count` 个字节的内容写入到 `stream` 所指代的文件。

```cpp
#include <cstdio>
int main() {
    FILE* fp = std::fopen("b.bin", "w");

    // 将 a 的二进制存储写入到 "b.bin"
    int a = 42;
    std::fwrite(&a, sizeof(a), 1, fp);

    // 类似，但写入一个数组
    int b[3] = {42, 56, 71};
    std::fread(&b, sizeof(int), 3, fp);
}
```

## 关闭文件

可以注意到，刚刚 `FILE*` 的使用和 `std::*fstream` 很类似。`fopen` 的作用类似于构造函数，`fread` `fscanf` 等等函数就相当于成员函数，而传入的 `FILE*` 参数其实就是在面向对象语法中的 `this`。

但最后还差一环，就是析构函数。在 C 语言中，变量的生存期结束并不会自动调用析构函数（也没有更好的自动化方案），所以我们需要手动通过 `fclose` 来“析构”掉 `FILE*` 所指向的对象。

```cpp
int fclose(std::FILE* stream);
```

所以，我们之前的所有代码，都需要在结尾加上 `fclose`，来保证对内存和文件资源的正确清理。

```cpp
#include <cstdio>
int main() {
    FILE* fp = std::fopen("b.txt", "w");
    int a = 42, b = 56, c = 71;
    std::fscanf(fp, "%d %d %d\n", a, b, c);
    
    // 必须手动关闭 fp！
    std::fclose(fp);
}
```

## `std::freopen`

`<cstdio>` 中定义了一些[宏](/appendix/preprocessor)，比如 `stdin` 和 `stdout`。这两个宏可以展开称 `FILE*` 类型的表达式，从 `stdin` 这个 `FILE*` 读取就是从标准输入读取（也就是黑框框里的键盘输入），而写入到 `stdout` 就是写入到标准输出（也就是黑框框界面中显示字符）。

换而言之，`scanf("%d", &a);` 就相当于 `fscanf(stdin, "%d", &a);`；而 `printf("%d", a);` 就相当于 `fprintf(stdout, "%d", a);`。

了解这些基本概念之后，再来看 `std::freopen`。它类似 `std::fopen`，也是打开文件；但它打开文件时会“抢占”一个已有的 `FILE*`。所谓的“抢占”，就是关闭这个 `FILE*` 原先所指代的文件，然后让这个 `FILE*` 指代我所打开的这个新文件。

```cpp
std::FILE* freopen(const char* filename, const char* mode, std::FILE* stream);
```

比如：
```cpp
#include <cstdio>
int main() {
    FILE* fp = std::fopen("a.txt", "w");
    // 本应对 fp 写入是写入到 a.txt...

    // 但 freopen 抢夺了 fp 原先的“指向”
    std::freopen("b.txt", "w", fp);

    // 现在向 fp 写入会写入到 b.txt。
    std::fprintf(fp, "Hello!\n");
    // 结果：b.txt 中出现 Hello!

    // 不要忘记关闭文件
    std::fclose(fp);
}
```

`freopen` 是唯一改变 I/O “指向”的标准方法，即“重定向”。当我们使用 `freopen` 改变 `stdin` 和 `stdout` 的“指向”后，那接下来的所以 `scanf` 和 `printf` 都会变成对 `freopen` 指定文件的读写。

```cpp
#include <cstdio>
int main() {
    std::freopen("input.txt", "r", stdin);
    std::freopen("output.txt", "w", stdout);

    // 从 input.txt 读取一个整数
    int a;
    std::scanf("%d", &a);

    // 写入到 output.txt
    std::printf("Hello!\n");

    // 关闭 input.txt 和 output.txt 文件
    std::fclose(stdin);
    std::fclose(stdout);
}
```

这种技巧在竞赛中较为常见。值得一提的是，`<iostream>` 中的流式输入输出 `cin` `cout` 和 `stdin` `stdout` 默认是关联的；当使用 `freopen` 重定向 `stdin` `stdout` 后，`cin` 和 `cout` 的输入输出也会随之重定向。