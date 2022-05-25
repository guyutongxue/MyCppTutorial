# 只读成员函数

回到我们的运算符重载。这一次我们要给 `String` 重载 `==` 这个运算符，指明两个字符串是相等的。

```cpp
bool String::operator==(const String& rhs) {
    if (len != rhs.len) return false; // 前提是长度得相等
    for (unsigned i{0}; i < len; i++) {
        if (str[i] != rhs.str[i])
            return false;             // 如果某一位不相等则不等
    }
    return true;
}
```
函数的工作原理很简单。注意从这里开始我们就用类外定义的形式来写成员函数了，减少一些篇幅（所以如果你在跟着操作的话，请不要忘记在类内添加上对应的声明）。

然后我们尝试使用它。
```cpp
#include <iostream>
int main() {
    String a("Hello"); // 你可以自己改变这个初始化值，看看效果变化
    // 下面的 "Hello" 通过两次隐式转换到 String，然后调用 == 重载
    if (a == "Hello") {
        std::cout << "Hi" << std::endl;
    }
}
```
现在看上去没有问题，当 `a` 为 `"Hello"` 的时候输出，不相等的时候不输出。那么接下来我们想扩展这段程序，把判断相等的部分挪到一个单独的函数中去。
```cpp
#include <iostream>
// 只需要 x 的值，所以用只读引用防止复制开销和更改
bool isOk(const String& x) {
    return x == "Hello" || x == "Hi";
}
int main() {
    String a("Hello");
    if (isOk(a)) {
        std::cout << "How are you?" << std::endl;
    }
}
```
感觉没问题，但真有问题。你会发现编译过不了了。为什么呢？问题就出在 `isOk` 的参数 `x` 是带 `const` 限定的。

假如我有一个类 `A`，它有一个成员数据 `data` 和一个成员函数 `change`：
```CPP
struct A {
    int data;
    void change() {
        data++;
    }
};
int main() {
    const A a;
//  a.change();  // 编译错误
}
```
那么，在 `main` 函数里面声明并定义只读的 `A` 类型对象 `a`。如果 `a` 的 `change` 能被调用的话，那么 `a` 的 `data` 成员就会发生更改，这就不符合“只读”的含义了。所以默认情形下**不能调用只读对象的成员函数**。

如果想要一个只读对象的成员函数可以被调用，需要给这个函数**整体**加上 `const` 限定。它的语法是：
```sdsc-legacy
*返回值类型* *类名*::*成员函数名*(**参数列表**) const *函数体*
```
也就是说把 `const` 关键字加在参数列表和函数体之间。这种被整体 `const` 限定的成员函数称为只读成员函数。比如：
```cpp
struct A {
    int data;
    void change() const {
//      data++; // 编译错误
    }
};
```
很显然，只读成员函数内部不能对成员数据做更改，也不能调用非只读的成员函数。也就是说，只读成员函数中的 `this` 类型是 `const T*` 的。

于是基于此，我们意识到原来的 `String` 类有许多函数是不会更改成员数据的，那么它们都应该整体加上 `const` 限定。比如刚刚的 `operator==`，又比如 `operator+` `length` `operator bool`。于是给他们加上 `const` 限定就好了（声明和定义都需要）。

## 只读与非只读重载

现在问题来到了 `operator[]` 上。
```cpp
char String::operator[](unsigned pos) {
    return str[pos];
}
```
首先我们先把返回值类型改成引用。否则的话，形如 `a[0] = '@'` 的表达式是没有效果的（这个原理类似之前返回 `*this`）。于是：
```cpp
char& String::operator[](unsigned pos) {
    return str[pos];
}
```
那么问题就是：这个函数该不该被整体 `const` 限定呢？如果不设置为只读的，那么我就没法对只读对象调用 `operator[]` 了。但如果设置为只读的，那么 `a[0] = '@'` 还是编译不过：只读成员函数中 `str[pos]` 是 `const char` 类型的，不能绑定到非只读的 `char&` 引用上。
```cpp
char& String::operator[](unsigned pos) const {
    return str[pos]; // 编译错误：不能将只读类型绑定到非只读引用上去
}
```
最终的解决方法是利用函数重载，声明两个 `operator[]` 成员函数，分别对应只读和非只读的版本：
```cpp
// 非只读版本
char& String::operator[](unsigned pos) {
    return str[pos];
}
// 只读版本
const char& String::operator[](unsigned pos) const {
    return str[pos];
}
```
然后，在调用 `operator[]` 时，编译器会优先选择整体带 `const` 限定的重载；如果不能，则选择非只读的。
```cpp
int main() {
    const String a("Hello");
    String b("Hello");
    a[0]; // 调用只读版本
    b[0]; // 调用非只读版本
}
```

> 只有成员函数才可以整体（在最顶层）加 `const` 限定。比如你定义类型别名 `using T = void()const;`，那么 `T` 只能作为成员类型出现在类的定义里，不能在类外使用。

## 只读成员数据

最后，我们简单提一下只读成员数据。既然是只读的，它就没有办法通过任何方式被赋值：
```cpp
struct A {
    const int data{0}; // 只读成员数据
    A() {
        data = 1;      // 错误：不能对只读类型赋值
    }
    void f() const {   // 这与函数 const 限定与否无关
        data = 1;      // 错误：不能对只读类型赋值
    }
};
```
而且，只读数据成员必须被显式地初始化，这和我们之前的写法是一致的：
```cpp
int main() {
    const int a;     // 错误：只读对象必须被初始化
    const int b{42}; // OK
}
```
所以说，这就要求只读成员必须拥有一个默认成员初始化器，或者出现在成员初始化列表中：
```cpp
struct A {
    const int data; // 如果这里不带默认初始化器的话……
    A(): data{42} { // 那么这里必须为它初始化
    }
};
```
