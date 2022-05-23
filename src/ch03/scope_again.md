# 再谈作用域

<!-- TODO -->
<!-- <style>
@import url(ch03/fig.css)
</style>
<script type="module" src="./scope_again.js"></script> -->

## 函数作用域

我们一直以来都将变量定义在函数的函数体里。要么是 main 函数，要么是其它自己定义的函数。因此这些变量的名字的作用域只停留在函数体内部；到了函数体结尾的 `}` 就无法再使用了。请看下例：
```cpp
#include <iostream>
using namespace std;
int getInput() {
    int n; // 变量名 n 的作用域开始（声明点）
    cin >> n;
    return n;
} // 变量名 n 的作用域结束
int main() {
    // 这里显然不能再使用 getInput 函数里的变量了
    int x{getInput()}; // 变量名 x 的作用域开始
    cout << x << endl;
} // 变量名 x 的作用域结束
```

所以我们做不到只通过这种形式让一个变量贯穿多个函数。比如：
```CPP
#include <iostream>
using namespace std;
void change(int a, int b) {
    a = 30;
    b = 50;
}
int main() {
    int a{3}, b{5};
    change(a, b);
    cout << a << " " << b << endl; 
}
```
这个例子和上一节提到的 `change` 函数完全相同。唯一不一样的地方是 change 函数形参的名字换成了 `a` 和 `b`，但是这样并没有任何区别。尽管它现在和 `main` 函数里的 `a` 和 `b` 名字相同，但是由于它们在各自的函数作用域内，所以互不干扰。同时上一节的图示也表明，两个函数的变量分别存储在各自的空间内，没有交集。所以这段代码编译运行的结果仍然为 `3 5`。

需要注意的一点是，对于函数形参名字，尽管它的声明点不在函数体内，但它的作用域仍然持续到函数体结束（废话，不然函数内就用不了了）。

## 全局作用域

整个 C++ 代码最顶层的作用域被称为全局命名空间作用域（Global namespace scope），简称**全局作用域**。对于目前说，那些不声明于任何一个函数内的名字——即外层没有任何包裹它的名字，都是全局作用域的。比如 main 函数就定义在全局作用域内。如果一个名字拥有全局作用域，则它的作用域起始于声明点，结束于整个代码**文件的结尾**。

变量名也可以拥有全局作用域。比如：
```CPP
#include <iostream>
using namespace std;
int a{42}, b{56};
int main() {
    cout << a << " " << b << endl;
}
```
其中，变量 `a` 和 `b` 的名字就拥有全局作用域。全局作用域和函数作用域最大的不同就在于，任何函数都可以使用全局作用域的名字。比如：
```CPP
#include <iostream>
using namespace std;
int a, b;
void change() {
    a = 30;
    b = 50;
}
int main() {
    a = 3;
    b = 5;
    change();
    cout << a << " " << b << endl;
}
```
这里的 `change` 函数就很自然地使用了全局作用域的名字 `a` 和 `b`。你会发现这段代码和之前一样仍然试图通过 `change` 函数来更改变量 `a` 和 `b` 的值，不过前两次都失败了。来看看这次能行得通吗？

<div class="fig">
<div id="fig1" class="raphael"></div>
<p id="fig1Text" class="info"></p>
</div>


我们称那些名字是全局作用域的变量为**全局变量**，名字不是全局作用域的变量为**局部变量**。所以，函数体内声明并定义的变量是局部变量，形参也是局部变量。通过全局变量，我们终于能够让 `change` 函数“永久”改变变量的值了。

> 有关一个变量存储的位置、分配内存和初始化的时机是存储期的相关知识。在[链表章节](/ch04/list/storage_duration.md)会有更多介绍。

> 一个很显然的事实是，全局作用域内定义的变量要么没有初始化器，要么必然是常量初始化的。因为它们的初始化发生在最早期，初始化值必然只能在编译期间确定。


最后用一个例子来总结我们学过的作用域：
```CPP
#include <iostream>                //    作用域  
using namespace std;               // ==============
int excelNumber{0};                // excelNumber  ┐
void excelCount(double score) {    // score  ┐     │
    if (score > 85) {              //        │     │
        excelNumber++;             //        │     │
    }                              //        │     │
}                                  // score  ┘     │
int main() {                       //              │
    double score{0.0};             // score  ┐     │
    for (int i{0}; i < 100; i++) { // i  ┐   │     │
        cin >> score;              //    │   │     │
        excelCount(score);         //    │   │     │
    }                              // i  ┘   │     │
}                                  // score  ┘     │
                                   // excelNumber  ┘
```

其中 `excelNumber` 是全局变量，而其它的都是局部变量。两个函数中的 `score` 互不相同，这一点我们之前已经有所了解了。

类似地，当局部变量与全局变量同名时，会发生[名字的隐藏](/ch02/part3/scope.md#名字的隐藏)。这时，全局变量会被局部变量屏蔽。

## 注意事项

第一，**C++ 要求函数的定义不能出现在函数体内**。就是说，目前而言函数只能定义在全局作用域——即函数定义不能出现在函数体里。所以下面的代码是错误的：
```cpp
int f() {
    int g() {
        // 嵌套定义是不被允许的，会导致编译错误
    }
}
```
同时，我们不建议将不含定义的函数声明写在函数体内部。
```cpp
int f() {
    int g(); // 不推荐
}
```

第二，**C++ 规定函数的形参不能是数组**。为什么？这是一个历史遗留问题，这里也给不出什么具体的解释。不过你如果强行把数组放在形参的位置上也不是不行——
```CPP
#include <iostream>
using namespace std;
void change(int a[2]) {
    a[0] = 30;
    a[1] = 50;
}
int main() {
    int a[2]{3, 5};
    change(a);
    cout << a[0] << " " << a[1] << endl;
}
```
就像这样。但是你会发现运行的结果貌似和我们预想的有所偏差……具体的原因我们会留到[指针章节](/ch04/pointer/pointer_and_array.md#数组到指针的转换)再做讲解。

> 除此之外，C++ 还有以下限制：
> - 函数的返回值不能是数组。
> - 函数的参数不能是函数。
> - 函数的返回值不能是函数。
