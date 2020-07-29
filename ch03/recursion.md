# 递归

## 从普通调用说起

首先从一个简单的例子入手。编写这样一个程序：输入一个大于 1 的整数，判断它是否为质数。那么根据质数的定义，你可以这样写：
```CPP
#include <iostream>
using namespace std;
bool isPrime(int x) {
    for (int i{2}; i < x; i++) {
        if (x % i == 0)   // 只要存在一个能除尽的约数
            return false; // 就不是质数
    }
    return true;          // 所有比它小的都除不尽，就是质数
}
int main() {
    int a;
    cin >> a;
    if (isPrime(a)) 
        cout << "Prime" << endl;
    else
        cout << "Not prime" << endl;
}
```
然后你会注意到在函数 `isPrime` 中，形参 `x` 可能的约数必然小于等于它的平方根。因此我们可以充分利用定义在头文件 `<cmath>` 里的 `std::sqrt` 函数计算平方根：
```CPP
#include <iostream>
#include <cmath>         // 这里增加一个头文件引入
using namespace std;
bool isPrime(int x) {
    int r;
    r = sqrt(x);                  // 计算平方根
    for (int i{2}; i <= r; i++) { // r 为上界
        if (x % i == 0)
            return false;
    }
    return true;
}
int main() {
    int a;
    cin >> a;
    if (isPrime(a)) 
        cout << "Prime" << endl;
    else
        cout << "Not prime" << endl;
}
```

> 一般地，`sqrt` 函数的声明为 `double sqrt(double arg);`。因此在上述代码第六行调用过程中，发生了整型与浮点类型之间的隐式转换。（这里忽略了许多细节，实际上 `sqrt` 接收整型实参时可能是一个模板函数。）

这样速度会快不少。如果你把整个程序的结构用之前的图示标示出来的话，就长成这样：

<style>
@import url(ch03/fig.css)
</style>
<div class="fig">
<div id="fig1" class="raphael"></div>
</div>

所以函数可以像这样一层一层嵌套起来调用。那么问题就来了，一个函数能否“调用它自己”？

## 认识递归

这个“调用自己”听上去特别玄乎。还是用一个例子来引入好了：求一个正整数的阶乘 $n! =\displaystyle \prod_{i=1}^ni=1\times2\times\cdots\times n$。你能否不适用循环语句来实现吗？

可以这样考虑，将 $n!$ 定义为：
$$1! = 1$$
$$n! =(n-1)!\times n$$
这样就可以 
$$\begin{aligned}
2!&= 1!\times 2=&2\\
3!&= 2!\times 3=&6\\
4!&= 3!\times 4=&24\\
&\qquad\cdots&
\end{aligned}$$
如此一路推算下去。如果用函数 `int fact(int);` 来表示阶乘的话，则 `fact(n)` 的值与 `n * fact(n - 1)` 的值相等。可以把这一思想这样表示出来：
```CPP
#include <iostream>
using namespace std;
int fact(int n) {
    if (n == 1) {
        return 1;
    } else {
        return n * fact(n - 1);
    }
}
int main() {
    cout << fact(4) << endl;
}
```

理解起来有难度？其实不用想太多，这种写法和原来的普通调用没有任何区别。请看下面的图示：

<div class="fig">
<div id="fig2" class="raphael"></div>
<p id="fig2Text" class="info"></p>
</div>

<script type="module" src="ch03/recursion.js"></script>

我们称这种在函数体内调用函数自身的编程方法为**递归（Recursion）**。从刚才的图中也可看出，递归式的调用与普通的函数嵌套调用是一样的，都是“一层一层”地执行，然后从内到外“一层一层”地返回到调用方。

递归唯一比较特殊的地方在于它需要有一个递归终止的条件。试想如果刚才的 `fact` 函数中缺少 `if (n == 1) return 1;` 这个判断的话，则调用将持续不断、永不停止地进行下去——直到计算机的内存放不下那么多函数的空间为止（这种现象俗称“爆栈”）。所以在进行递归调用前需要**谨慎地考虑它终止的条件**。

<!-- 这里应该放更多的例题，但是我懒了。  -->

### 经典例题

