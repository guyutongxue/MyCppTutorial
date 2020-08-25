# C 输入输出

在 C++ 中，我们用 `cin` 和 `cout` 来控制输入输出；然而在 C 中，我们需要用两个函数
```c
int scanf(const char*, ...);
int printf(const char*, ...);
```
来做这件事情。比如
```cpp
int a{42};
cin >> a;
cout << a;
```
需要替换成
```c
int a = 42;
scanf("%d", &a);
printf("%d", a);
```

## 输出：`printf`

首先，我们来看一下 `printf` 输出的用法。`printf` 这个函数它的第一个参数是一个字符串（实际上是指针）。在默认情况下，程序会输出这个字符串的内容，比如：
```c
printf("Hello, world!");
```
就会输出 `Hello, world!`。如果你要输出一个数，你就需要在输出数的位置上加上占位符（Placeholder）。比如，我想输出 `Hello 42`，就需要这样做：
```c
printf("Hello %d", 42);
```
其中，`%d` 表示这里应该输出一个整数。输出哪个整数呢？这个值应当在后面的第二参数提供。类似地，你可以输出两个、三个整数：
```c
printf("The sum of %d and %d is %d", a, b, a + b);
```
这里面提供了三个 `%d` 占位符，它们分别对应 `printf` 后面的第二、第三、第四个参数。这时，如果 `a` 为 `1`，`b` 为 `2` ，就会输出 `The sum of 1 and 2 is 3`。

C 语言没有判断参数类型的能力，所以你需要通过占位符来指定输出内容的类型。比如，刚刚 `%d` 表示这里应当输出 `int` 类型的值。类似地，`%f` 表示输出 `double` 类型的值。

常用类型的占位符分别是：

| 类型                             | 占位符 |
| -------------------------------- | ------ |
| `int`                            | `%d`   |
| `short`                          | `%hd`  |
| `long`                           | `%ld`  |
| `long long`<sup>※</sup>          | `%lld` |
| `unsigned int`                   | `%u`   |
| `unsigned short`                 | `%hu`  |
| `unsigned long`                  | `%lu`  |
| `unsigned long long`<sup>※</sup> | `%llu` |
| `double`                         | `%f`   |
| `long double`                    | `%Lf`  |
| 字符类型                         | `%c`   |
| 指针类型（`void*`）              | `%p`   |
| 字符串（`char*`）                | `%s`   |

<p class="small">※ C99 起</p>

除此之外，还有这些占位符：

| 占位符           | 含义                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| `%o`             | 以**八进制**输出 `unsigned int` ，类似地有 `%ho` `%lo` `%llo` （含义同上） |
| `%x`             | 以**十六进制**输出 `unsigned int`，类似地有 `%hx` `%lx` `%llx`             |
| `%X`             | 同上；但字母大写                                                           |
| `%e`             | 以**科学记数法**输出 `double`，类似地有 `%Le`                              |
| `%E`             | 同上；但字母大写                                                           |
| `%a`<sup>※</sup> | 以**十六进制**输出 `double`，类似地有 `%La`                                |
| `%A`<sup>※</sup> | 同上；但字母大写                                                           |
| `%g`             | 取 `%f` 和 `%e` 中较短者输出                                               |
| `%G`             | 取 `%f` 和 `%E` 中较短者输出                                               |
| `%%`             | 输出 `%`                                                                   |

<p class="small">※ C99 起</p>

除此之外，在 `%` 后面可以可选地依次加上 *修饰*、*宽度* 和 *精度* 的限制，即。
```sdsc
%**修饰**&hairsp;**宽度**&hairsp;**精度**&hairsp;**h/l/ll/L**&ZeroWidthSpace;*上述占位符*
```

其中：
- *修饰* 是如下字符之一：
    - `-`：指明输出左对齐（见下）
    - `+`：强制输出正号
    - ` `：强制正数多输出一个空格（从而与负号对齐）
    - `#`：调整输出格式：
        - 对于整型，输出 `0` `0x` `0X` 前缀；
        - 对于浮点类型，强制输出小数点
    - `0`：用 `0` 而非 ` ` 作为补齐字符
- *宽度* 是如下之一：
    - 整数：指定输出的最小宽度；默认左侧补齐空格（此行为可通过 *修饰* 改变）
    - `*` 字符：*宽度* 由该占位符对应参数前的一个额外 `int` 参数提供
- *精度* 是如下之一：
    - `@.*整数*@`：
        - 对于整型，指定最小位数为 `@*整数*@`；
        - 对于浮点类型，指定小数点后位数为 `@*整数*@`；
        - 对于 `%g` 或 `%G` 等，指定最大有效数字个数为 `@*整数*@`；
        - 对于字符串，指定最大输出字符个数
    - `.*`：*精度* 由该占位符对应参数前的一个额外 `int` 参数提供

例：
```C
#include <stdio.h>
int main(void) {
    printf("Strings:\n");
    const char* s = "Hello";
    printf(".%10s.\n.%-10s.\n.%*s.\n", s, s, 10, s);
 
    printf("Characters:     %c %%\n", 65); /* 65: 'A' */
 
    printf("Integers\n");
    printf("Decimal:        %i %d %.6i %i %.0i %+i %u\n", 1, 2, 3, 0, 0, 4, -1);
    printf("Hexadecimal:    %x %x %X %#x\n", 5, 10, 10, 6);
    printf("Octal:          %o %#o %#o\n", 10, 10, 4);
 
    printf("Floating point\n");
    printf("Rounding:       %f %.0f %.32f\n", 1.5, 1.5, 1.3);
    printf("Padding:        %05.2f %.2f %5.2f\n", 1.5, 1.5, 1.5);
    printf("Scientific:     %E %e\n", 1.5, 1.5);
    printf("Hexadecimal:    %a %A\n", 1.5, 1.5);
    return 0;
}
```
输出：
```io
Strings:
.     Hello.
.Hello     .
.     Hello.
Characters:     A %
Integers
Decimal:        1 2 000003 0  +4 4294967295
Hexadecimal:    5 a A 0x6
Octal:          12 012 04
Floating point
Rounding:       1.500000 2 1.30000000000000004440892098500626
Padding:        01.50 1.50  1.50
Scientific:     1.500000E+00 1.500000e+00
Hexadecimal:    0x1.8p+0 0X1.8P+0
```

## 输入：`scanf`

