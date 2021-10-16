# 函数

## 什么是函数

现在来重新审视一下上一节写过的 `max` 函数：
```cpp
int max(int x1, int x2) {
    int y;
    if (x1 > x2) {
        y = x1;
    } else {
        y = x2;
    }
    return y;
}
```
其实第 2 行到第 7 行这些写法和我们之前写的代码并无差异，只不过换了个地方而已。基于这个事实，我现在给出 C++ 中函数的定义：

在 C++ 中，**函数（Function）是体现一段过程的代码**。即 C++ 通过函数来构造发给计算机的命令序列。**函数的主体是多条语句**，一般负责完成一项特定的任务。

你会发现这里函数的定义与数学上截然不同。实际上，计算机中函数又被称为“子程序”（Subprogram），这是因为函数其实**相当于把程序的一部分提取出来**。请看下例：
```CPP
#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    int c;
    if (a > b) {
        c = a;
    } else {
        c = b;
    }
    cout << c << endl;
}
```
这段程序可以输出输入的两个数之中较大的那个；而使用函数把比较的那一部分拿出来的话：
```CPP
#include <iostream>
using namespace std;
int max(int x1, int x2) {
    int y;
    if (x1 > x2) {
        y = x1;
    } else {
        y = x2;
    }
    return y;
}
int main() {
    int a, b;
    cin >> a >> b;
    int c;
    c = max(a, b);
    cout << c << endl;
}
```
这是完全等价的代码。也就是说，`max` 函数将原来代码中 7 到 11 行的部分独立出来；换句话说，把这几行所代表的那段过程用 `max` 函数所表示了出来。

正因为函数只是过程的体现，所以我可以把任何语句放入函数中：
```cpp
int max(int x1, int x2) {
    cout << "Hello, function!" << endl;
    return x1 > x2 ? x1 : x2;
}
```
只不过就是把输出这条命令放入了 `max` 函数规定的过程中。

## 形式参数与返回值

函数在执行它所代表的过程的时候，可以**接收**一些外部的数据，也可以把一些数据（如根据接收的数据进行运算的结果）**传回**外部。因此，过去我们说的函数的“变元”实际上就是接收外部数据的一种方式。这些接受的数据需要以变量的形式存储，称这些变量为**形式参数（Parameter）**，简称**形参**。
```cpp
int max(int x1, int x2) { // x1 和 x2 就是形参
    return x1 > x2 ? x1 : x2;
}
```
这个例子中，函数（过程）`max` 需要接收两个数据，并通过一段过程将这两个数据的较大的那个传回去。因此这两个数据以两个 `int` 类型变量的形式传入，也就是变量 `x1` 和 `x2`。

那么如果这个函数不需要外界提供任何数据呢？那么就有了无形参的函数：
```cpp
int getInput() {  // 没有形参
    int n;
    cin >> n;
    return n;
}
```
这个 `getInput` 函数实际上表达了“输入一个整数”这个过程，并将输入的这个数传回给使用这个函数的地方——比如我在别的地方写下 `a = getInput();` 的时候，变量 `a` 就被赋值为刚刚输入的那个数。

函数“传回”的这个值被称为函数的**返回值**。如果想要传回返回值，需要将这个值写在 `return` 后面（被称为 return 语句，见下文）。函数返回值的类型是固定的，必须在函数开头就呈现出来。比如：
```cpp
unsigned int abs(int x) { // unsigned int 是函数的返回值类型
    unsigned int y;
    y = (x >= 0 ? x : -x);
    return y; // 变量 y 的值就是这个函数的返回值
}
```

如果一个函数不需要传回任何数据，那么可以不写返回值。此时需要强调的是，返回值类型被称为 `void`。请看下例：
```CPP
#include <iostream>
using namespace std;
void printNum(int x) {
    cout << x << endl;
}
int main() {
    printNum(42);
}
```
这里 `printNum` 执行了“输出一个整数”的过程。因此它不需要传回什么类似计算结果的值。这时，函数的返回值类型写作 `void`，同时也不需要写 `return` 那一行了：当返回 `void` 的函数抵达函数体的最后一行时，会自动退出函数的执行。因为没有返回值，所以诸如 `a = printNum(42);` 这种写法显然是错误的。

`void` 是 C++ 关键字，是**空类型（Void type）**的类型说明符，但永远不存在空类型的变量。用数学的说法，空类型变量组成的集合是空集。

> 实际上，空类型是永远无法被完整定义的不完整类型。

最后一个例子展示了既没有形参，也没有返回值的一个函数。
```CPP
#include <iostream>
using namespace std;
void show() {
    cout << "*************************************" << endl;
    cout << "*     System error has occurred.    *" << endl;
    cout << "* Please contact the administrator. *" << endl;
    cout << "*    Sorry for the inconvenience.   *" << endl;
    cout << "*************************************" << endl;
}
int main() {
    show();
}
```
函数 `show` 是一个什么也没有的函数，它就是纯粹地展示了函数的本分——执行一段过程。这里 `show` 所指明的过程是输出一些提示信息。

## 为什么？

刚刚说过，函数的作用就是将程序的一部分过程提取出来。那么我们为什么非得要提取出来？直接放在原来的位置上不好吗？

请看下面的例子：
```CPP
#include <iostream>
using namespace std;
int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int maxab;
    if (a > b) maxab = a;
    else maxab = b;
    cout << "Max of (a, b) is " << maxab << endl;
    int maxbc;
    if (b > c) maxbc = b;
    else maxbc = c;
    cout << "Max of (b, c) is " << maxbc << endl;
}
```

这段代码中，先求出 `a` 和 `b` 的最大值并输出，又求出 `b` 和 `c` 的最大值并输出。但你会发现这两次求值的代码几乎是一样的，只有变量名不同；也就是说我们几乎把一段代码抄了两遍。如果把这段过程用函数来概括起来，则原先的程序直接写作：
```CPP
#include <iostream>
using namespace std;
int max(int x,int y) {
    if (x > y) return x;
    else return y;
}
int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << "Max of (a, b) is " << max(a, b) << endl;
    cout << "Max of (b, c) is " << max(b, c) << endl;
}
```
这样我们用很少的代码量就实现了原来同样的功能。从这个角度出发，函数所体现的用途就是：减少重复或相似的代码，提高可读性。