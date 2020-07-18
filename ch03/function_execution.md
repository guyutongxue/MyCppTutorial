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

我们这一节将详细讲解计算机如何执行一个函数。

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
    2. **传递**参数：将实际参数带入 max 函数的形式参数（后面会细讲）；
    3. **保存**并暂停 main 函数：保存 main 函数的执行状态并暂时不管它。
2. 在函数调用完成**后**，也需要做三件事情：
    1. **接收**返回值（若有）：将 max 函数的返回值作为整个调用表达式的值；
    2. **释放** max 函数：将刚刚分配的内存“扔”掉，也就是释放掉；
    3. **恢复** main 函数：恢复刚刚保存的 main 函数执行状态，继续执行剩余的过程。

<script src="ch03/function_execution.js"></script>

