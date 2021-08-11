# 默认实参

我在这里穿插一个额外的知识点：默认实参。

## 函数默认实参

假设我现在有一个函数
```CPP
#include <iostream>
void greeting(const char* who) {
    std::cout << "Hello, " << who << std::endl;
}
int main() {
    greeting("world");
    greeting("Alice");
}
```
我们可以给它的参数提供一个默认值：
```cpp
void greeting(const char* who = "world") {
    std::cout << "Hello, " << who << std::endl;
}
```
这时，我在调用函数时可以略去带有默认值的参数：
```cpp
int main() {
    greeting(); // 使用默认实参，相当于 greeting("world");
    greeting("Alice"); // 不使用默认实参
}
```

默认实参就是允许在函数调用表达式中省去末尾若干个实参的语法。它的语法形式是在函数形参后接 `@= *默认实参值*@`。当调用表达式略去这个实参时，相当于将 `@*默认实参值*@` 当做实参传入了函数。

换句话说，你可以将默认实参理解成提供了若干个新的重载：
```cpp
void greeting() {
    const char* who = "world";
    std::cout << "Hello, " << who << std::endl;
}
void greeting(const char* who = "world") {
    std::cout << "Hello, " << who << std::endl;
}
```

函数的默认实参**只能在末尾**的几个参数提供。如：
```cpp
void f(int a, int b = 42) { } // OK
void f(int a = 42, int b) { } // 编译错误，默认实参不在结尾
void f(int a = 42, int b = 56) { } // OK，默认实参都在结尾
```

在调用带有默认实参的函数时，也只能省略末尾的若干个参数：
```cpp
void f(int a, int b = 42, int c = 56) { }
int main() {
    f(1);      // 相当于 f(1, 42, 56); 省略了 b 和 c
    f(1, 2);   // 相当于 f(1, 2, 56); 省略了 c
//  f(1, , 3); // 错误：没有这种语法
}
```

默认实参的值可以是表达式，但它有一些限制（如不能（在求值语境下）使用局部变量、`this` 等）。表达式的求值是在函数调用期间完成的，求得的值会用来初始化函数形参。
```CPP
#include <iostream>
int x{0};
void f(int a = 2 * (++x)) { // 默认实参为 2 * (++x)，每次调用求值
    std::cout << a << std::endl;
}
int main() {
    f();  // 对默认实参求值
    f(1); // 不对默认实参求值
    f();  // 对默认实参求值
}
```

如果函数被多次声明，则默认实参**只能出现在其中一次声明**的位置上。同一形参位置多次出现默认实参是编译错误：
```cpp
    void f(int a, int b = 42);
//  void f(int a, int b = 42); // 错误：不能多次提供 b 的默认实参
    void f(int a, int b);      // OK
```

提供默认实参的形参可以省略名字。尽管这看上去没有什么用。
```cpp
void f(int a, int = 42); // 略去第二个形参的名字，但提供默认实参
```

成员函数也可以使用默认实参，但非函数调用的运算符重载不能。

## 默认模板实参

类似地，模板参数也可以提供默认实参。

非类型模板默认实参的写法和函数默认实参非常像：
```CPP
template<int N = 42, int M = 56>
int add() {
    return N + M;
}
int main() {
    add<>()   // 实例化 add<42, 56>
    add<1>(); // 实例化 add<1, 56>
}
```

非类型默认模板实参同样也包括如下语法限制：
- 默认模板实参只能在模板形参列表结尾提供；
- 模板实参列表中也只能省略结尾的若干个模板实参；
- 如果函数模板多次被声明，则同一位置的模板默认实参只能出现在其中一个声明中。

但默认模板实参由于其编译期实例化的特点，要求非类型**默认模板实参值必须是常量**。这是它与函数默认实参最显著的不同点。

类型模板实参拥有类似的语法：
```CPP
// int 是类型模板形参 U 的默认模板实参
template<typename T, typename U = int>
struct S {
    T mem1;
    U mem2;
};
int main() {
    S<double> a; // 实例化 S<double, int>
}
```

类型模板默认实参可以使用一个固定的类型，或者任意之前已经被声明的类型（包括前面的模板形参）组成的“表达式”。这个“表达式”并不是真正的表达式，是指由一些类型通过模板、嵌套类或别名声明等一系列语法组成的新类型。比如：

```cpp
template<typename T>
struct Helper {
    T help() { /* [...] */ }
};
// 依赖于 T 的类型“表达式”作为 U 的默认模板实参
template<typename T, typename U = Helper<T>>
T f() {
    U helper;
    return helper.help();
}
// 例：f<int>(); 实例化 f<int, Helper<int>>
```

当可以进行模板实参推导时，若某个模板形参没有推导出其值但提供了默认模板实参，则推导成功并采用默认模板实参。这个过程对于类模板、函数模板、非类型模板参数或类型模板参数都适用。
```CPP
template<typename T, typename U = int>
U cast(T a) {
    return static_cast<U>(a);
}
int main() {
    cast(3.14); // 推导出 T = double，无法从函数实参推导 U
                // 但 U 提供了默认参数 int，从而 U = int
                // 得到返回值类型为 int
}
```

提供默认模板实参的模板形参可以省略其名字。与函数默认实参不同，这种写法是有一定用处的，我将在比较靠后的篇幅提到。
```cpp
template<typename T, typename = void> // 省略第二个模板形参名
void f() { }
```
