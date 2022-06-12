# 闭包

假设有这样的需求：计算 $\displaystyle\sum_{i=a}^bi^n$，但 $n$ 是一个不固定的数，需要用户输入。按照之前的想法，我们可以向 `sum` 传入一个 Lambda 表达式：

```cpp
#include <iostream>
#include <cmath>

double sum(int a, int b, double term(int)) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    int n;
    std::cin >> n;
    // 定义于 <cmath> 的 std::pow 可计算 a^n 的值
    sum(1, 5, [](int a) { return std::pow(a, n); });
}
```

但这里就引入了上一节遗留的问题：Lambda 表达式中不能使用局部变量 `n`。当然你可以将 `n` 设置为全局变量；但这里我如果就不这样做，非要是局部变量，那该如何处理？

答案是使用**闭包**（Closure）。闭包是一个很特别的编程术语，专门指代可以读取其它函数局部变量的函数。我们要在这一节手动实现一个闭包，方法是：定义一个特别的类，以及它的 `operator()`。

首先，定义一个类 `MyLambda`，以及其中的一个成员数据 `n`：

```cpp
class MyLambda {
public:
    int n;
};
```

这样，我们可以初始化一个 `MyLambda` 类的对象以及它的成员为用户输入的值：

```cpp
int main() {
    int n;
    std::cin >> n;
    MyLambda x{n}; // 初始化成员数据 n
}
```

随后，为 `MyLambda` 类定义 `operator()`。这样，`lambda` 就可以像一个函数一样使用：

```cpp
#include <iostream>
#include <cmath>

class MyLambda {
public:
    int n;
    double operator()(int a) const {
        return std::pow(a, n);
    }
};

double sum(int a, int b, double (*term)(int)) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    int n;
    std::cin >> n;
    MyLambda x{n};
    sum(1, 5, x); // 像函数一样使用对象 x……
}
```

但可惜的是，这样编译并过不了。尽管对象 `x` 可以像函数一样使用，比如 `x(a)`，但它并不能转换到 `double(*)(int)` 类型。只要解除这个类型限制，就可以实现所有的功能了。解除限制的方法很简单，就是让这个 `term` 形参的类型变成一个模板形参：

```cpp
template<typename F>
double sum(int a, int b, F term) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}
```

将 `sum` 改成这个样子之后，就无关乎 `term` 的具体类型是什么了：如果传入的实参是 `double(*)(int)`，那 `term` 就是函数指针；如果传入的实参是刚刚的 `x`，那 `term` 就是 `MyLambda` 类型。随后，只要 `term(a)` 是合法表达式，那编译就没有问题了。以下是完整代码：

```cpp codemo(show)
#include <iostream>
#include <cmath>

class MyLambda {
public:
    int n;
    double operator()(int a) const {
        return std::pow(a, n);
    }
};

template<typename F>
double sum(int a, int b, F term) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    int n;
    std::cin >> n;
    MyLambda x{n};
    std::cout << sum(1, 5, x) << std::endl;
}
```

类似这份代码中的 `term`，可以以 `term(a)` 的形式调用，或者说出现在函数调用运算符的左侧的对象，称为**可调用对象**（Callable object）。常见的可调用对象有：
- 函数；
- 函数指针；
- 可转换到函数指针的对象；
- 重载了 `operator()` 的对象（即“函数对象”）；Lambda 表达式。

## 带捕获的 Lambda 表达式

事实上，Lambda 表达式的完整版其实就是我们刚刚实现的闭包。刚刚的代码和下面的写法是一致的：

```cpp codemo(show)
#include <iostream>
#include <cmath>

template<typename F>
double sum(int a, int b, F term) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    int n;
    std::cin >> n;
    std::cout << sum(1, 5, [n](int a) { return std::pow(a, n); }) << std::endl;
}
```

注意其中的 `[n](int a) { return std::pow(a, n); }`。这是一个 Lambda 表达式，但与之前不同的是，它开头的中括号内给出了额外的 `n` 字样。这个中括号是 Lambda 的**捕获**（Capture）语法。如果你想要在 Lambda 表达式中使用一些局部变量，则需要将它的名字放在捕获里。比如这个 Lambda 表达式中使用了局部变量 `n`，所以我要把 `n` 放在捕获的中括号里。**Lambda 表达式实际上就是一个匿名类的对象**，类似我们之前的 `MyLambda` 的实现。它提供了 `operator()` 以像函数一样使用这个对象。如果存在捕获，则将这些捕获定义为类的成员，并用局部变量的值初始化它们。

Lambda 表达式具体的捕获语法比较复杂，我将这些细节问题放到了下一节。
