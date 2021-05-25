# 非成员的运算符重载

## `cout` 的语义

还是熟悉的 `String`类，我们之前一直通过调用成员 `.str` 的方法来输出：
```cpp
#include <iostream>
int main() {
    String a("hello");
    std::cout << a.str << std::endl;
}
```
然而这个 `.str` 确实有一些令人厌烦。该如何去掉它呢？那么我们先从 `std::cout` 这个东西入手。

`std::cout` 其实是一个对象，它的类型为 `std::ostream`。也就是说，在头文件 `<iostream>` 的某个位置存在这样的声明：
```cpp
namespace std {
    class istream;
    class ostream; // std::ostream 的声明

    // extern 表示引入的名字是声明而非定义，这里不用管它
    extern istream cin;
    extern ostream cout; // std::cout 是 ostream 类型的变量
    extern ostream clog;
    extern ostream cerr;
}
```

然后呢，`<<` 是一个运算符。如果你阅读了[位运算符](ch02/part2/bit_operator.md)这一节的话，你会知道它是“左移运算符”，在一般情况下它的操作数都是整数。
```cpp
1 << 2; // 左移运算符的一般用法
```

而这里，类似 `cout << a` 的写法其实是左移运算符的表达式。它的左操作数是 `std::ostream` 类型的变量，而右操作数可以是任何算术类型、C 风格字符串之类的东西。所以说，这里，标准库定义了若干个关于运算符 `<<` 的重载。比如，当我们写下
```cpp
int a;
std::cout << a;
```
时，`<<` 运算符调用了形如下面的重载：
```cpp
class ostream {
public:
    // [...]
    ostream& operator<<(int value) {
        // 输出 value 的值
        return *this;
    }
};
```
需要注意的是，它的返回值类型为 `std::ostream&`，值为 `*this`。这保证了 `std::cout << a` 表达式的结果仍然是 `std::cout` 本身。又因为 `<<` 运算符是从左到右结合的，所以 `std::cout << a << b` 就等价于 `(std::cout << a) << b`：先执行 `std::cout << a` 输出 `a`，然后就相当于计算表达式 `std::cout << b` ，这时会输出 `b`。这样就保证了一系列 `<<` 可以把所有要输出的值连接起来按顺序输出。

那么现在我们要做的是输出 `String`，也就是要为 `std::ostream` 的 `<<` 运算符定义一个右操作数为 `const String&` 类型的重载。但 `std::ostream` 已经是标准库中定义的类型了，我们不可能再把它的定义拆开往里面添加一个成员函数。所以这里我们需要引入非成员的运算符重载语法。

## 非成员的运算符重载形式

先举另一个例子。我们之前重载了 `String` 的 `+`，使得 `String + String` 表达式被定义。由于转换构造函数的存在，`String + const char[N]` 也是被允许的：
```cpp
int main() {
    String a("Hello");
    a + " world"; // OK，const char[N] 被转换为 String 类型
}
```
但
```cpp
int main() {
    String a("world");
    "Hello " + a; // 错误：const char* 没法和 String 做加法
}
```
会导致错误。

这是因为对于形如 `a @ b` 的二元运算符：其中 `@` 是任意非赋值的运算符，`a` 的类型为 `A`，`b` 的类型为 `B`；我们已经知道如果 `A` 为类类型，则可以在 `A` 的定义中写下：
```cpp
class A {
public:
    T operator@(B/*可选地为引用，或带 const 限定*/ b) /* 可选地带 const */;
};
```

如果成员函数列表里面找不到这样的重载，而 `B` 是类类型，则编译器会在**全局定义域**检查形如这样的函数：
```cpp
T operator@(A/*可选地为引用，或带 const 限定*/ a, B/*可选地为引用，或带 const 限定*/ b);
```
如果有，就执行它。（注意这里不会再检查 `B` 的成员，因此刚刚 `"Hello " + a` 并不能实现我们想要的结果。）所以我们应该在全局作用域写下这样的函数：
```cpp
String operator+(const char* a, const String& b) {
    return String(a) + b; // 在实现里，转换为 String::operator+(String) 就可以
}
```

> 非成员的运算符重载要求至少有一个操作数是类类型的。所以你不能“覆盖”原有内置类型的运算符运算规则。

这就是非成员的运算符重载了。不过与此相比，对于 `operator+` 更好的处理是只定义非成员的 `String operator+(const String& a, const String& b);`，这样任何可以隐式转换到 `String` 的类型出现在两侧都可以调用它。你会在[总结](ch06/summary.md)中看到这个版本。

## 回到输出 `String`

那么回到重载运算符 `<<` 上，相比思路也非常清晰了。我们需要做的只不过是：
```cpp
#include <iostream>
std::ostream& operator<<(std::ostream& os, const String& b) {
    os << b.str;
    return os;
}
```
这里面注意返回值类型为 `std::ostream&`，是为了保证“链式”地输出是合法的。其返回值应当是左侧操作数（实参为 `cout`，这里为形参 `os`）的引用，所以第一参数的类型也是引用类型的。（因为输出 C 风格字符串可能会对 `cout` 内部成员做修改，所以第一参数不能设置为 `const` 的。）

现在来试一试这两个非成员的运算符重载：
```cpp
int main() {
    String b("world");
    std::cout << ("Hello " + b) << std::endl;
}
```

除此之外，输入也是同样的道理。`std::cin` 是 `std::istream` 类型的，它拥有若干个 `>>` 的重载；它们都返回左操作数（`*this`），所以可以连起来用。*如果* 想让 `String` 也能被 `cin`，我们所需要做的就是实现下面的函数：
```cpp
std::istream& operator>>(istream& is, String& b);
```
但由于我们目前的 `String` 定义很难高效、正确地实现用户输入，所以这里只是示意一下，不提供代码。如果你定义了一个自己的类，想去实现其 `std::cin` 的输入，则你需要自己去实现类似上面的函数。