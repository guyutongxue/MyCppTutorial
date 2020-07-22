# 再谈作用域

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

整个 C++ 代码最顶层的作用域被称为全局命名空间作用域（Global namespace scope），简称**全局作用域**。比如 main 函数就定义在全局作用域内。

全局作用域内也可以声明变量名。比如：
```CPP
#include <iostream>
using namespace std;
int a{42}, b{56};
int main() {
    cout << a << " " << b << endl;
}
```
其中，变量 `a` 和 `b` 的名字就出现在了全局作用域。全局作用域和函数作用域最大的不同就在于，任何函数都可以使用全局作用域中的名字。比如：
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
这里的 `change` 函数就很自然地使用了全局作用域内的名字 `a` 和 `b`。你会发现这段代码和之前一样仍然试图通过 `change` 函数来更改变量 `a` 和 `b` 的值，不过前两次都失败了。来看看这次能行得通吗？

