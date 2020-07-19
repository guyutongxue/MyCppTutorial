# 函数的执行

<style>
div.fig {
    position: relative;
    border  : 1px dashed grey;
    overflow: auto;
}
div.fig:after {
    content  : '图片仅供示意';
    position : absolute;
    bottom   : 0;
    right    : 0;
    font-size: smaller;
    color    : grey;
}
div.raphael {
    display        : flex;
    justify-content: center;
}
.raphael text {
    white-space: pre;
    user-select:  none;
}
p.info {
    padding: 0 2em;
    min-height: 4em;
}
</style>

## main 函数

聪明的你可能已经发现，我们第一章、第二章写的代码一直都写在
```cpp
int main() {
    // 这里面
}
```
这样一个东西里面。然而这个东西实际上长得很像一个函数定义——一个返回值为 `int`、同时不接收任何参数的名为 `main` 的函数。没错，这个东西的的确确是一个函数，被称为 **main 函数**（或称主函数）。

**main 函数规定了 C++ 程序执行的入口。**请这样想，所有的函数都代表了一个过程，同时整个程序本身也是一个过程；因而整个程序也可以用一个函数来表达。这个函数就是 main 函数了。当编译、运行一段 C++ 代码时，计算机会首先从 main 函数执行；如果 main 函数执行完毕，则整个程序就执行完毕退出。

**C++ 标准规定 main 函数的返回值必须为 `int` 类型。** main 函数的返回值的意义我们目前没有必要掌握，只需了解以下事实：若 main 函数的返回值为 `0`，则代表程序正常完成工作并正常退出；若非 `0`，则代表因发生了意外状况而退出。因此你会在许多其它书的样例程序中见到这样的代码：
```cpp
int main() {
    // other code...
    return 0;
}
```
它的含义就是代表程序将正常退出。但为什么我们一直没有写 `return 0;` 这条语句呢？因为 C++ 标准特别地允许 main 函数无需 return 语句。当 main 函数执行到函数体结尾却没有遇到 return 时，将自动地执行 `return 0;`。所以说在一般情形下，main 函数结尾可以省去 return 。

## 执行细节

接下来我们将详细了解计算机如何执行一个函数。

首先你需要了解一件事情，就是目前计算机再执行一个程序的时候，是通过读取一系列的指令来实现的。实际上，计算机总是将一个函数作为一个整体进行读取；也就是说，计算机首先读取一个函数里面的所有指令，然后再依次执行这些指令。那么这些被读取的指令存放在哪里呢？它们实际上被存放在一个称为“内存”的存储空间里。

举个例子。对于这段代码
```cpp
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    int c{a + b};
    cout << c << endl;
}
```
来说，计算机如何执行它编译得到的那段程序呢？请看下面这张图（点击开始按钮）：

<div class="fig">
<div id="fig1" class="raphael"></div>
<p id="fig1Text" class="info"></p>
</div>

现在来考虑如果加上一个函数 `int max(int, int)` 并调用它，会发生什么呢？代码如下：
```cpp
#include <iostream>
using namespace std;
int max(int x,int y) {
    int z;
    if (x > y)
        z = x;
    else
        z = y;
    return z;
}
int main() {
    int a, b, c;
    cin >> a >> b;
    c = max(a, b);
    cout << c << endl;
}
```
那么它编译出的程序将这样执行：
<div class="fig">
<div id="fig2" class="raphael"></div>
<p id="fig2Text" class="info"></p>
</div>

整个过程中，需要注意有两点：
1. 在调用函数**前**，需要做三件事情：
    1. **初始化** max 函数：为 max 函数分配一定大小的内存，并将 max 函数中的指令存入；
    2. **传递**参数（若有）：将实际参数带入 max 函数的形式参数（后面会细讲）；
    3. **保存**并暂停 main 函数：保存 main 函数的执行状态并暂时不管它。
2. 在函数调用完成**后**，也需要做三件事情：
    1. **接收**返回值（若有）：将 max 函数的返回值作为整个调用表达式的值；
    2. **释放** max 函数：将刚刚分配的内存“扔”掉，也就是释放掉；
    3. **恢复** main 函数：恢复刚刚保存的 main 函数执行状态，继续执行剩余的过程。

## 参数传递

现在来放大看一看在调用函数前，程序是如何传递参数的。还是刚才的例子：
```cpp
#include <iostream>
using namespace std;
int max(int x,int y) {
    int z;
    if (x > y)
        z = x;
    else
        z = y;
    return z;
}
int main() {
    int a, b, c;
    cin >> a >> b;
    c = max(a, b);
    cout << c << endl;
}
```
其中 main 函数在第 14 行执行了调用，实际参数为 `a` 和 `b` 的**值**；max 函数在第 3 行给出定义，形式参数为 `x` 和 `y` 这两个**变量**。刚才说过，这个参数传递的过程是一个“用实参代入形参”的过程。具体来讲就是：**用实参去初始化形参。**

因为形参是一个变量，所以在初始化函数的时候形参也需要被初始化。然而这个初始化过程需要一个初始化值；恰好实参就是一个值，故**用实参作为形参的初始化值**。形象地讲，就是：
```sdsc
int x{*main 函数里 a 的值*};
int y{*main 函数里 b 的值*};
```

所以人们常说，这是一个“复制”的过程。这是说，传递参数的过程相当于把原来 main 中的数据拷贝出来，初始化为 max 函数形参的值。这个时候，main 函数中的 x 和 y，与 max 函数中的 a 和 b 是没有任何关系的两组变量，只是它们的值相等罢了。

下面来看这个例子：
```cpp
#include <iostream>
using namespace std;
void change(int c,int d) {
    c = 30;
    d = 50;
}
int main() {
    int a{3}, b{5};
    change(a, b);
    cout << a << " " << b << endl; 
}
```
请问它的输出会是什么？

如果你拿不准的话，请看下面的图示。

<div class="fig">
<div id="fig3" class="raphael"></div>
<p id="fig3Text" class="info"></p>
</div>


<script type="module" src="ch03/function_execution.js"></script>