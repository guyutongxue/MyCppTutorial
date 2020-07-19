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
```cpp
#include <iostream>
```

## 全局作用域

整个 C++ 代码最顶层的作用域被称为全局命名空间作用域（Global namespace scope），简称**全局作用域**。比如 main 函数就定义在全局作用域内。