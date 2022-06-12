# 赋值运算符重载

实际上，读者们可能已经猜到了，这一节我们要做的事情——重载赋值运算符，对于 `String` 类来说其实很简单。因为我们已经有了一个现成的：
```cpp
class String {
public:
    // [...]
    void assign(const String& assignVal) {
        delete[] str;
        len = assignVal.len;
        str = new char[len];
        for (unsigned i{0}; i < len; i++) {
            str[i] = assignVal.str[i];
        }
    }
};
```
`assign` 函数了。所以，我们只需要把 `assign` 的名字改成 `operator=` 就可以了：
```cpp
class String {
public:
    // [...]
    void operator=(const String& assignVal);
};
```
哦对了，还有返回值类型得是 `String&` 类型的，不然 `a = b = c` 这种表达式也没法用。稍微改一改：
```cpp
class String {
public:
    // [...]
    String& operator=(const String& assignVal) {
        delete[] str;
        len = assignVal.len;
        str = new char[len];
        for (unsigned i{0}; i < len; i++) {
            str[i] = assignVal.str[i];
        }
        return *this; // 返回绑定到自己的引用
    }
};
```

这就结束了吗？当然不是。因为现在我们要修复一个小问题。这个问题会发生在下面的代码中：
```cpp
#include <iostream>
int main() {
    String a("hello");
    a = a; // 问题发生的地方
    std::cout << a.str << std::endl;
}
```

我们发现这段程序无法输出想要的结果——貌似是程序在运行的时候出现错误了？为什么呢？

请注意 `a = a;` 这个语句会调用 `a.operator=` 函数，也就是之前的 `assign`。在函数内部，它一上来就 `delete` 释放了 `a.str` 指向的那片空间，然后把参数 `a.str` 指向的空间的内容复制过去……等等，`a.str` 指向的空间已经被释放了！也就是说，我们丢失了 `a` 的数据。

所以解决这个问题的办法就是检测一下，如果出现了“自赋值”的情况就什么都不做，直接返回。
```cpp
class String {
public:
    // [...]
    String& operator=(const String& assignVal) {
        if (str == assignVal.str) return *this; // 自赋值直接返回
        delete[] str;
        len = assignVal.len;
        str = new char[len];
        for (unsigned i{0}; i < len; i++) {
            str[i] = assignVal.str[i];
        }
        return *this;
    }
};
```

最后，我们需要知道的就是，赋值运算符的重载是比较特殊的。请看下面的例子：
```cpp codemo(show)
struct A {
    int data;
};
int main() {
    A a{12}, b{34};
    b = a; // 编译通过
}
```
我们并没有在类 `A` 中定义赋值运算符重载，但 `b = a` 却是合法表达式。这是因为在某些条件下，编译器会隐式生成一个赋值运算符重载：
```cpp
struct B { /* 定义略 */ };
struct A {
    int a;
    B b;
    // [...]
    // 下面是编译器生成的赋值运算符重载
    A& operator=(const A& rhs) {
        a = rhs.a;
        b = rhs.b;
        /* 这样一直做下去，对所有成员进行赋值 ... */
        return *this;
    }
}
```
这个赋值运算符重载姑且称为预置赋值运算符重载吧。它干的事情就是给每一个成员都进行一次赋值

那么什么条件下编译器会帮我们做这件事情呢？答案是当你没有定义形如：
- `A operator=(T);`
- `A operator=(T&);`
- `A operator=(const T&);`
  
（其中返回值类型 `A` 是任意的）这样的赋值运算符重载时，编译器会生成预置赋值运算符重载。这几种赋值运算符重载被称为**复制赋值重载**（Copy assignment overload）。如果不好记的话，就只记 `const T&` 一种最常用的就行。

> 和复制构造函数一样，`A operator=(T&);` 某种程度上是违反直觉的，我们并不提倡使用。除此之外，复制赋值重载还包括带 `volatile` 限定的两个版本：`A operator=(volatile T&)` 和 `A operator=(const volatile T&);`。
>
> 如果其中某一个成员（设其类型为 `M`）只定义形如 `A operator=(M&);` 这样不带 `const` 限定的复制赋值重载，那么编译器会转而生成 `T& operator=(T&);` 类型的预置赋值运算符重载而非带 `const` 限定版本的（因为这样会编译错误：无法把非只读引用绑定到只读变量上）。

你会发现，我们的 `String` 类定义的 `operator=` 就是复制赋值重载的一种。所以编译器不会画蛇添足地添加预置赋值运算符重载。而我们没有定义这样形式的赋值运算符重载时，编译器就会自动添加一个。所以这保证了在一般情形下，`a = b` 总是合法的。

为什么说“一般情形”呢？因为我们还有两个小玩意儿 `=delete` 和 `=default`。它们在这里同样适用。`=default` 强制编译器生成预置赋值运算符重载，而 `=delete` 将避免编译器自动生成预置赋值运算符重载。所以，如果这个东西被 `=delete` 了，`a = b` 就不合法了：
```cpp codemo(show)
struct A {
    A& operator=(const A&) = delete;
};
int main() {
    A a, b;
//  a = b; // 编译错误
}
```

