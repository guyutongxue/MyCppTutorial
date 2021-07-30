# 第八章 模板基础

C++ 最具特色的语言特性就是模板（Template）。最常见的模板是函数模板（Function template）类模板（Class template）。

为了引入，我们考虑之前在[重载](ch05/overload)一节所描述的代码（略作调整）：

```CPP
#include <iostream>
// 以下四个函数名字都是 print，但接受的形参类型不同
void print(int x) {
    std::cout << x << std::endl;
}
void print(double x) {
    std::cout << x << std::endl;
}
void print(char x) {
    std::cout << x << std::endl;
}
void print(const char* x) {
    std::cout << x << std::endl;
}
int main() {
    // 调用时，编译器会根据实参类型选择对应的函数
    print(42);
    print(3.14);
    print('@');
    print("Hello");
}
```

在上面这段程序中，可以发现 `std::cout << x << std::endl;` 这行语句出现了 4 次，很啰嗦。甚至，这四个 `print` 函数除了参数类型不一样之外是完全相同的。那么相同的代码重复多遍总归是不好的，C++ 的模板可以解决这个问题。

函数模板，顾名思义，就是一个可以**生成**若干个类似函数的东西。下面就是我们在这个例子中需要的函数模板：
```cpp
template<typename T>
void print(T x) {
    std::cout << x << std::endl;
}
```

看上去并不复杂，唯独在前面多了一行 `template` 云云。模板的声明总是由 `template` 关键字开头的，然后后面接着模板的定义。我们并不在这里展开这个定义的具体写法，我们目前只关注定义了这个模板带来的效果：

```CPP
#include <iostream>
// 刚才定义的模板
template<typename T>
void print(T x) {
    std::cout << x << std::endl;
}
// 定义了上述模板之后就不再需要写任何 print 函数了
int main() {
    // 以下四个调用完全 OK，编译通过
    print(42);
    print(3.14);
    print('@');
    print("Hello");
}
```

当模板被定义后，不再需要写原来的四个 `print`，`main` 函数里就能开始调用它了。这是因为，函数模板会根据全文中出现的函数调用表达式来生成函数。在这个例子中，函数模板生成了
- `void print(int);`
- `void print(double);`
- `void print(char);`
- `void print(const char*);`

四个函数（以重载的形式），从而整段程序编译通过。

下一节开始，你将会学到函数模板与类模板的具体使用方法。