# 非类型模板参数

在之前的模板例子中，我们总是在用类型模板参数。比如：
```CPP
// 函数模板：类型模板形参 T
template<typename T>
T max(const T& a, const T& b) {
    return a > b ? a : b;
}

// 类模板：类型模板形参 T
template<typename T>
struct A {
    T mem;
};

int main() {
    max(3, 4);   // 模板实参 int 是类型
    A<double> a; // 模板实参 double 是类型
}
```

但实际上，模板参数并不一定非得是类型。它可以是一个变量，比如：
```cpp
template<int N>
int multiply(int m) {
    return N * m; 
}
```

这里，函数模板 `multiply` 具有模板形参 `N`。这个形参不是类型形参（不是 `typename` 开头的），而是一个非类型形参，或者说是变量形参。非类型形参只不过是说，模板中实例化时被替换掉的不再是类型成分而是变量成分了。比如：
```cpp
int main() {
    multiply<4>(3);
}
```
这里 `4` 就是非类型模板实参。这行调用表达式会实例化出 `multiply<4>` 这样一个函数：
```cpp
int /* multiply<4> */(int m) {
    return 4 * m;
}
```

类似地，类模板也可以使用非类型模板参数：
```CPP
template<typename T, int N>
class Array {
private:
    T data[N]{};

public:
    void fill(const T& value) {
        for (int i{0}; i < N; i++) {
            data[i] = value;
        }
    }
};
int main() {
    Array<int, 5> a;
    a.fill(42);
}
```

这个例子中，模板类 `Array` 有两个模板形参，第一个是类型形参 `T`，第二个是非类型形参 `N`。它们分别替换模板的类定义中的不同部分。而 main 函数中的实例化 `Array<int, 5>` 定义两个类型实参分别为 `int` 和 `5`，相当于用 `int` 替换模板的类定义中的 `T`，用 `5` 替换其中的 `N`。最终，`Array<int, 5>` 会出现了一个 `int[5]` 类型的数组私有成员。

## 非类型模板参数的推导

非类型模板参数在少数情形下也可以参与模板实参推导。

```CPP
#include <iostream>
// 当类型形参作为数组大小出现时可以推导
// 这里 int(&)[N] 是到 int[N] 的引用类型
// 注：函数参数不能是数组（否则退化为指针），但可以是
// 到数组的引用类型或指向其的指针类型，此时不会退化
template<int N>
int size(int(&arr)[N]) {
    return N;
}
int main() {
    int a[5]{};
    int s{size(a)}; // 推导模板实参为 5，实例化 size<5>
    std::cout << s << std::endl; // 输出 5
}
```

CTAD 也是可以的：

```CPP
template<int N>
struct S {
    S(int(&)[N]) { }
};
int main() {
    int a[5];
    S s(a); // 推导为 S<5>
}
```

> 这里简单介绍一下非推导语境。尽管模板参数推导很智能，但它并不能应付所有的场景。在以下场景中的模板参数不会参与推导：
> - 类型标识中 `::` 的左侧出现的模板形参
> - 表达式中的非类型模板形参（如 `int(*)[2 * N]` 中的 `N`）
> - 拥有函数默认实参的函数形参类型（见下节）
> - 函数实参为重载函数
> - 函数实参中（即将退化的）数组的大小
> - 函数实参为列表初始化器（模板形参为数组或 `std::initializer_list` 除外）
> - decltype 中的表达式（见后续章节）
> - 出现形参包的一系列场景（见后续章节）

## 非类型模板参数和函数参数的区别

在函数模板中，既然函数参数也是非类型的，那么为什么要设计非类型模板参数，而不直接用函数参数呢？换而言之，下面两个东西，在实际使用上有什么区别呢？
```cpp
template<int N, int M>
int add() {
    return N + M;
}
int add(int n, int m) {
    return n + m;
}
int main() {
    // 有什么区别？
    add<1, 2>(); // 调用模板 add，实例化为 add<1, 2>
    add(1, 2);   // 调用函数 int add(int, int)
}
```

读者可以先自己想一想。这两者的区别仍然在于模板这个概念的定义上。

对于模板 `add`，它是有能力生成大量的函数的语法。当你用不同的模板实参去实例化它时，会得到不同的函数。但函数 `add` 永远只是那一个函数。从编译器角度来看，`add<1, 2>` 和 `add<3, 4>` 是两个函数，而 `add(1, 2)` 和 `add(3, 4)` 调用的是同一个函数。如果你阅读了[静态局部变量](/ch04/list/storage_duration#静态局部变量（选读）)这一节，你可以这样验证：
```CPP
#include <iostream>
template<int N>
void f() {
    static int a{0};
    std::cout << ++a << std::endl;
}
void g(int n) {
    static int a{0};
    std::cout << ++a << std::endl;
}
int main() {
    // 以不同模板实参调用 f 模板，
    // 每次都生成不同的实例，
    // 不同实例中静态局部变量 a 分别只自增一次，
    // 最终输出 1 1 1
    f<1>(); f<2>(); f<3>();
    // 多次以不同参数调用 g 函数
    // 每次调用的都是同一个函数
    // 导致每次调用静态局部变量 a 都会发生自增，
    // 最终输出 1 2 3
    g(1); g(2); g(3);
}
```

除此之外，由于模板的实例化是在编译期间完成的，所以**模板实参必须是常量**。
```CPP
template<int N, int M>
int add() { return N + M; }
int main() {
    add<1, 2>();        // OK
    int a{2};
//  add<1, a>();        // 编译错误，a 不是常量，无法编译期求值
    constexpr int b{2}; // b 是常量
    add<1, b>();        // OK
    const int c{a};     // c 是只读变量，但不是常量
//  add<1, c>();        // 编译错误
}
```

> C++ 语法要求非类型模板参数具有结构化类型（Structural Type），指：左值引用、整数类型、指针类型（含 `nullptr` 和成员指针）、枚举类型、浮点类型和满足少数条件的类类型。