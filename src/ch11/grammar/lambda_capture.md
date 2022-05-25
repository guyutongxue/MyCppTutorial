# Lambda 表达式捕获

这一节介绍 Lambda 表达式的捕获语法。首先，完整的 Lambda 表达式语法是：

```sdsc-legacy
[ **捕获** ] <div class="opt-block">(<i>参数列表</i>)</div> <div class="opt-block">-><i>返回值类型</i></div> *函数体*
```

其中，`@*捕获*@` 是若干个由逗号分隔的 `@*捕获符*@`。所谓的捕获符，简单来说就是要捕获的变量名。比如上一节的例子

```cpp
int main() {
    int n;
    auto f = [n](int a) { return std::pow(a, n); };
}
```

中，`n` 就是一个简单的捕获符。如果要捕获多个变量，那么就是 `[a, b, c]` 这样。这种形式的捕获符称为**复制捕获**：它将局部变量复制一份，存放到 Lambda 表达式生成的匿名类的成员。此外，捕获符还可以是**引用捕获**。比如：

```CPP
#include <iostream>
int main() {
    int n;
    auto f = [&n]() { n = 42; };
    f();
    std::cout << n << std::endl; // 输出 42
}
```
这个例子中，`&n` 就是引用捕获。引用捕获符的语法是 `@&*变量名*@`，它的语义相当于：

```cpp
struct MyLambda {
    int& n{/* main 函数中的 n */};

    auto operator()() const {
        n = 42;
    }
};
MyLambda f;
```

即匿名类的成员 `n` 具有引用类型，且绑定到 main 函数中的局部变量 `n`。这样，在 Lambda 表达式内对 `n` 修改也会影响到全局的 `n`。引用捕获和复制捕获可以同时出现，比如 `[&a, b]`，但不能是同一变量名。

> 标准不要求引用捕获必须如此实现，也可以通过指针等实现。

## 默认捕获符

如果有大量的局部变量需要被捕获，那手动列举出所有待捕获的变量是一件很繁琐的事。C++ 提供了默认捕获符语法，可以捕获 Lambda 表达式所在作用域内的所有名字。

`[=]` 是默认复制捕获符。它将当前作用域内的所有变量复制一份到匿名类的成员：

```CPP
#include <iostream>
int main() {
    int a{1}, b{2}, c{3};
    // 复制捕获 a, b, c
    auto f = [=] { return a + b + c; }; // 空的参数列表 () 可省略
    std::cout << f() << std::endl; // 输出 6
}
```

`[&]` 是默认引用捕获符。Lambda 表达式内可以访问和修改当前作用于内的所有变量。

```CPP
#include <iostream>
int main() {
    int a{42}, b{56};
    auto swap = [&] {
        int c;
        c = a; // 可以访问并修改 main 中的局部变量
        a = b;
        b = c;
    };
    swap();
    std::cout << a << ' ' << b << std::endl; // 56 42
}
```

默认复制捕获符后可跟随若干引用捕获符，比如 `[=, &a, &b]`，此时只有 `a` 和 `b` 是引用捕获，其余变量是复制捕获。类似地，也有 `[&, a, b]` 等写法。

## `mutable` 修饰

默认情形下，Lambda 表达式生成的匿名类的 `operator()` 是带有 `const` 限定的。比如，`[](int a) { return a + 1; }` 生成的匿名类是：
```cpp
struct MyLambda {
    auto operator()(int a) const {
        return a + 1;
    }
};
```

这使得 Lambda 表达式函数体内不能修改匿名类的成员，也就是不可以修改复制捕获到的变量。

```cpp
int main() {
    int a;
    [=] { a = 42; }; // 编译错误：a 被复制捕获，但函数体不能修改它
}
```

为了解除这一限制，可在 Lambda 表达式中添加 `mutable` 修饰：

```cpp
int main() {
    int a;
    [=] mutable { a = 42; }; // OK
}
```

有 `mutable` 修饰的 Lambda 表达式，生成匿名类时不会为 `operator()` 添加 `const` 修饰。

> `mutable` 关键字本意是修饰一些非静态成员，使得它们在整个对象为 `const` 时仍然可以改动。比如：
> ```cpp
> struct S {
>     int a;
>     mutable int b;
> };
> const S s{};
> int main() {
>     s.a = 1; // 错误：s.a 只读
>     s.b = 2; // OK
> }
> ```

## 其它语法

C++14 之后，捕获符还包含许多其它形式，比如带初始化器的捕获、形参包的捕获等等。它们出现的场合并不多，我就不在这里详细介绍了。有兴趣的读者可参阅 [CppReference](https://zh.cppreference.com/w/cpp/language/lambda)。
