# 字符类型

字符类型（Character type）变量，顾名思义是用来存储字符的变量。它也包括许多分类，不过我们只需要掌握其中一种就够了。这一种就是之前提到过的 `char` 型变量。

<h6 id="idx_ASCII+字符"></h6>
<h6 id="idx_不可见字符"></h6>
<h6 id="idx_可见字符"></h6>

`char` 型变量是用于存储部分字符的变量。这部分字符被称作 **ASCII 字符**，它包括**不可见字符**和**可见字符**两部分，共 128 个。除了这 128 个字符之外的字符一般不能用 `char` 型变量来存储。其中：

- 不可见字符 33 个，包括换行、Tab（制表符）、退格、删除和响铃等控制字符。
- 可见字符 95 个，包括大小写字母、数字和常见符号等打印字符。

可见字符可以用单引号引起的方式表示出来。比如
```cpp
char at{'@'};
```
定义了一个名为 `at` 的字符型变量，它的初始化值是 `'@'` ，也就是目前存储了 `@`  这个字符。

## 存储细节

C++标准规定 `char` 型的大小为 1 字节。这就是为什么有的时候 `char` 就是字节类型的同义词。

常识告诉我们，计算机中只能存储二进制数，不能直接存储一个字符。所以计算机采用了 **ASCII 码表**来实现字符到数的对应。比如：

- `' '` （空格）对应 20
- `'0'` （字符 0）对应 48
- `'1'` （字符 1）对应 49
- ……
- `'@'` 对应 64
- `'A'` 对应 65
- `'B'` 对应 66
- ……
- `'Z'` 对应 90
- `'a'` 对应 97
- `'b'` 对应 98
- ……

等等。有时我们称字符所对应的数为这个字符的ASCII码。完整的ASCII码表可以参见书后附录，我们不需要特别记忆它。

<h6 id="idx_转义字符"></h6>

我们已经知道了如何将一些可见字符赋值给字符类型，那么如何将不可见字符——比如换行符赋给字符类型呢？又如何使用单引号 `'` 和双引号 `"` 却不引起歧义呢？这时需要使用转义字符这个概念。**转义字符（Escaped character）**是以反斜杠 `'\'` 开头的字符。反斜杠及其后面的字符将**作为一个整体**代表一个新的含义的字符。比如，我们使用 `'\n'` 表示换行符，使用 `'\t'` 表示制表符。可能的转义字符在下表列出：

| 转义字符 | 描述 | 表示 |
| --- | --- | --- |
| `\'`  | 单引号 | ASCII 编码中为字节 0x27 |
| `\"`  | 双引号 | ASCII 编码中为字节 0x22 |
| `\?`  | 问号 | ASCII 编码中为字节 0x3f |
| `\\`  | 反斜杠 | ASCII 编码中为字节 0x5c |
| `\a`  | 响铃 | ASCII 编码中为字节 0x07 |
| `\b`  | 退格 | ASCII 编码中为字节 0x08 |
| `\f`  | 换页 | ASCII 编码中为字节 0x0c |
| `\n`  | 换行 | ASCII 编码中为字节 0x0a |
| `\r`  | 回车 | ASCII 编码中为字节 0x0d |
| `\t`  | 水平制表 | ASCII 编码中为字节 0x09 |
| `\v`  | 垂直制表 | ASCII 编码中为字节 0x0b |
| `\nnn`  | 任意八进制值 | 字节 nnn |
| `\xnn`  | 任意十六进制值 | 字节 nn |

同样地，转义字符也可以作为“一句话”的一部分出现在双引号内。下面是一个使用转义字符的例子：
```CPP
#include <iostream>
using namespace std;
int main() {
    cout << "This is the first line!\n"; // \n 是换行的意思，和 endl 类似
    cout << '\a' << '\\' << endl;        // \a 是响铃的意思； \\ 是输出反斜杠 \ 本身
    cout << '\"' << "\'\"" << endl;      // \" 是输出双引号 " ； \' 是输出单引号 '
}
```
它的编译运行结果为（并可能响铃一次）：

```io
This is the first line!
&#92;
&quot;&apos;&quot;
```

> 响铃与否取决于你使用的终端。如果直接在终端运行的话，Windows 10 会发出“噔咚咚”的响铃；macOS 可能会发出“嘟”的一声。

你可能已经注意到了，字符型和布尔型都属于整数类型的范畴。因此它们都可以像整数那样进行计算如加法、减法等：比如 `'A' + 1` 的结果就是 `'B'` 。下面这个例子简单演示了字符类型的运算：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a{64};  // @ 的 ASCII 值为 64
    int b{'Z'};
    int c{b - a};
    char d{'a' + 12};
    cout << a << " " << b << endl;
    cout << c << " " << d << endl;
}
```
它的运算结果如下，你可以对照 ASCII 码表进行验证：

```io
@ 90
26 m
```

> 实际上， `char` 类型也区分 `signed` 与 `unsigned` 。但是你可以发现它们的取值范围分别是 -128 ~ 127 和 0  256；其中都覆盖了 ASCII 码表的取值范围（0 ~ 127）。因此在存储 ASCII 字符时， `char` 的有无符号性是没有影响的。

## 总结

至此我们已经将 C++ 的最基础的类型——算术类型讲解完毕了。下面这张表大致地总结了它们：

<div class="table-wrapper">
<table>
<thead>
    <tr>
        <th style="text-align:center" rowspan="2">类型说明符</th>
        <th style="text-align:center" rowspan="2">含义</th>
        <th style="text-align:center" rowspan="2">一般的字节数</th>
        <th style="text-align:center" colspan="2">一般的取值范围</th>
    </tr>
    <tr>
        <th style="text-align:center"><code>signed</code>（可省略）</th>
        <th style="text-align:center"><code>unsigned</code></th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>bool</code></td>
        <td>布尔类型</td>
        <td>1</td>
        <td style="text-align:center" colspan="2"><code>true</code>或 <code>false</code></td>
    </tr>
    <tr>
        <td><code>char</code></td>
        <td>字符类型</td>
        <td>1</td>
        <td style="text-align:center" colspan="2">ASCII 字符</td>
    </tr>
    <tr>
        <td><code>short</code></td>
        <td>短整型</td>
        <td>2</td>
        <td>$-2^{15}$ ~ $2^{15}-1$</td>
        <td>$0$ ~ $2^{16}$</td>
    </tr>
    <tr>
        <td><code>int</code></td>
        <td>整型</td>
        <td>4</td>
        <td>$-2^{31}$ ~ $2^{31}-1$</td>
        <td>$0$ ~ $2^{32}$</td>
    </tr>
    <tr>
        <td><code>long</code><sup>※</sup></td>
        <td>长整型</td>
        <td>4</td>
        <td>$-2^{31}$ ~ $2^{31}-1$</td>
        <td>$0$ ~ $2^{32}$</td>
    </tr>
    <tr>
        <td><code>long long</code></td>
        <td>扩展长整型</td>
        <td>8</td>
        <td>$-2^{63}$ ~ $2^{63}-1$</td>
        <td>$0$ ~ $2^{64}$</td>
    </tr>
    <tr>
        <td><code>float</code></td>
        <td>单精度浮点型</td>
        <td>4</td>
        <td style="text-align:center" colspan="2">6~7 位有效数字</td>
    </tr>
    <tr>
        <td><code>double</code></td>
        <td>双精度浮点型</td>
        <td>8</td>
        <td style="text-align:center" colspan="2">15~16 位有效数字</td>
    </tr>
    <tr>
        <td><code>long double</code></td>
        <td>扩展精度浮点型</td>
        <td>不少于 8</td>
        <td style="text-align:center" colspan="2">不少于 15 位有效数字</td>
    </tr>
    </tbody>
</table>
</div>
<p class="small">※ 在 64 位的 UNIX 或类 UNIX 系统下， <code>long</code> 占用 8 字节，表示范围与 <code>long long</code> 相同。</p>

## 练习

1. 仿照上一章的“猜数游戏”，编写一个“猜字母”的游戏：程序指定一个大写字母，允许用户通过多次输入来猜测是哪一个字母，直至猜对为止。猜错的提示与“猜数游戏”相同，输出提示是猜“大”了还是“小”了。（提示： `char` 型变量仍然可以通过大于、小于号进行比较。）

## 练习参考答案

```CPP
#include <iostream>
using namespace std;
int main() {
    char ans{'G'}; // 答案
    char x{'A'};   // 这里不写初始化器也没有问题。
    cin >> x;
    while (x != ans) {
        if (x > ans) {
            cout << "That's bigger than the answer. Try again?" << endl;
        }
        if (x < ans) {
            cout << "That's smaller than the answer. Try again?" << endl;
        }
        cin >> x;
    }
    cout << "Bingo! You got the answer!" << endl;
}
```

