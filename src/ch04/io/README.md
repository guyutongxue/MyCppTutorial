---
next: ./input.md
---
# 输入输出成分


计算机的四大功能是存储、运算、控制和输入输出，我们在第二章细致地讲解了 C++ 程序如何实现其中三个：[存储](/ch02/part1/README.md)、[运算](/ch02/part2/README.md)和[控制](/ch02/part3/README.md)，只剩一个输入输出成分未能讲解。这一节，在有了大量的知识基础之后，我们终于可以讨论一些输入输出相关的问题了。

先让我们从字符串的输入讲起吧。我们上节学到了如何输出一个字符串（字面量或者由字符数组构成）：
```cpp
char a[]{"Hello"};
cout << a << endl;
```
```cpp codemo(input=Hello!)
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    cin >> a;          // 直接输入字符串到字符数组 a
    cout << a << endl; // 输出 a 中存储的字符串
}
```
事实上，你可以像这段代码一样直接向字符数组输入字符串（当然，这要求你输入的字符串不能超过 29 位，否则就放不下了），它在输入 `Hello!` 后会原封不动地输出 `Hello!`。

```cpp codemo(input=Hello; world!, clear)
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    cin >> a;          // 直接输入字符串到字符数组 a
    cout << a << endl; // 输出 a 中存储的字符串
}
```
那么看看这个吧。啊嘞，为什么只输出了一部分呢？你可以再检查一下 `a` 的各元素的值，发现确实只存储了 `"Hello,"` 而没有存储后面的 `" world!"`——也就是说后面根本就没输入进去。这是为什么呢？

原因是因为 `cin >>` 在读入字符串的时候，遇到空格、Tab 和回车就会自动停止读取。停止读取后，程序将输入的字符们串起来，追加 `'\0'`，随后存入要输入的字符数组中。那空格及后面的字符呢？它们会留给下一次输入：
```cpp codemo(show, input=Hello; world!)
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    char b[30]{};
    cin >> a;
    cout << "string a is: " << a << endl;
    cin >> b;
    cout << "string b is: " <<  b << endl;
}
```
这样的程序运行结果如下。
```io
¶Hello, world!↵
string a is: Hello,
string b is: world!
```
这里，第 6 行和第 7 行的工作原理和我们之前所述相同。但是第 8 行的输入语句并没有等待我们的输入，反而是直接执行了第 9 行的输出。这是为什么呢？这里就需要介绍一个叫做缓冲区的概念。

## 缓冲区

<h6 id="idx_缓冲区"></h6>

我们的输入是从键盘这个设备发起的，由我们编写的程序接受。但这个过程并不是直接的，从键盘发出的输入信号需要经过一个叫**缓冲区**（Data buffer）的东西，然后才能到达我们的程序。具体而言请看下面的动画吧：

<script setup>
import "@src/ch03/fig.css";
</script>
<div class="fig" style="height: 650px; overflow: hidden">
<iframe src="https://guyutongxue.gitee.io/mycpptutorial-animations/buffer/" height="765" width="960" style="left:0; right: 0; border: 0px; transform:scale(0.75, 0.75) translate(-12.5%, -12.5%)"></iframe>
</div>

总结下来就是：

<h6 id="idx_挂起"></h6>

- 程序从缓冲区读入数据；
- 如果缓冲区是空的，则程序**挂起**（Suspend）。挂起的含义就是暂停运行，等待用户进行输入操作；
- 键盘上的输入需要在按下回车键（即输入了回车符 `'\n'`）才会进入缓冲区；
- 程序读取缓冲区的数据遵循一定的规则：如 `cin >>` 遇到空格停止、忽略空格等等。

那么问题来了，如果我就想读取一个带空格的字符串，该怎么做？`cin >>` 做不到的，我们还有别的办法。下一节，我们将讲解各种其它常用的字符串输入方法。
