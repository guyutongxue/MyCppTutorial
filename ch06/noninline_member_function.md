# 类外定义成员函数

让我们再次停下来，插入一个小知识点。首先看看我们的 `String` 类已经写了什么：
```cpp
#include <cstring>
class String {
private:
    unsigned len;

public:
    char* str;

    String() {
        len = 0;
        str = new char[1]{'\0'};
    }
    String(const String& initVal) {
        len = initVal.len;
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal.str[i];
    }
    String(const char* initVal) {
        len = std::strlen(initVal);
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal[i];
    }
    String(unsigned num, char c) {
        len = num;
        str = new char[num + 1];
        for (unsigned i{0}; i <= num; i++)
            str[i] = c;
        str[num] = '\0';
    }
    ~String() {
        delete[] str;
    }

    char operator[](unsigned pos) {
        return str[pos];
    }
    String operator+(const String& b) {
        char* newstr{new char[len + b.len + 1]};
        std::strcpy(newstr, str);
        std::strcpy(newstr + len, b.str);
        String result(newstr);
        delete[] newstr;
        return result;
    }
    String& operator+=(const String& b) {
        String result(operator+(b)); //
        operator=(result);
        return *this; 
    }
    String& operator=(const String& assignVal) {
        if (str == assignVal.str) return *this;
        delete[] str;
        len = assignVal.len;
        str = new char[len];
        for (unsigned i{0}; i < len; i++) {
            str[i] = assignVal.str[i];
        }
        return *this;
    }
    explicit operator bool() {
        if (len == 0) return false;
        else return true;
    }

    unsigned length() {
        return len;
    }
};
```

嗯，在不知不觉中我们已经写了将近七十行代码了。假想有一个人想要了解我们的 `String` 类，看到这样大量的代码，想必会略微有一些头疼。我们希望能把整个 `String` 类最主要的部分体现出来，方便更多人查阅。所以，从这个角度出发，我们可以把函数的定义扔到类的定义外面去，只留下声明：
```cpp
#include <cstring>
class String {
private:
    unsigned len;

public:
    char* str;

    String();
    String(const String&);
    String(const char*);
    String(unsigned, char);
    ~String();

    char operator[](unsigned);
    String operator+(const String&);
    String& operator+=(const String&);
    String& operator=(const String&);
    explicit operator bool();

    unsigned length();
};
```
这下就简洁多了！这样只要大体扫一眼这个类的定义就能知道 `String` 类能做什么了：如何构造、重载了哪些运算符、有什么可以用的成员函数。但刚刚扔出去的成员函数定义怎么办呢？

很简单，在类外面都写回来就可以。但这时要注意，我们需要在每个函数名前面加上一个叫做“限定标识符”的东西——在这里，就是 `String::`。还是先看例子吧。
```cpp
class String {
    // 只剩下成员函数声明了
};
// 成员函数定义在外面：

// 默认构造函数定义
String::String() {
    len = 0;
    str = new char[1]{'\0'};
}
// 析构函数定义
String::~String() {
    delete[] str;
}
// [] 重载定义
char String::operator[](unsigned pos) {
    return str[pos];
}
// length 成员函数定义
unsigned String::length() {
    return len;
}
// [...]
```

道理很简单，就是把定义挪到了外面，函数名前面加上 `String::` 而已。这个 `String::` 的作用也很明显，它指明尽管这个定义看上去是在外面的，其实它是一个 `String` 的成员函数——所以它可以访问 `String` 类的各种成员（包括私有的）。

所以类外定义成员函数很简单，就是把声明留下，定义搬走，然后加上 `@*类名*::@` 前缀。那么有人就说了，这不是画蛇添足吗，要写的代码量反而更多了。确实是这样，但这样的写法可以让我们把这些成员函数的定义和类的定义分成两个文件。比如用 `String` 举例，我们把成员函数定义统统放在 `my_string.cpp` 里，而把只包含成员函数生命的类的定义放在 `my_string.h` 里。

![](https://s3.ax1x.com/2021/01/31/yA7wVK.png)

然后回顾一下[翻译过程](ch03/review_cpp.md#编译（翻译）过程)这一章，事实上我们可以单独 *编译* `my_string.cpp`。注意这里的 *编译* 不包含链接过程。然后我们得到了一个包含若干个函数二进制块的“对象文件”—— `my_string.o`。但它是没办法执行的（因为没有 `main` 函数）。同时，我的 `main` 函数只需 `#include "my_string.h"`，也能成功 *编译* 通过（因为编译过程不需要函数定义，只需声明就可以；查找声明对应的定义是链接器的任务）。

现在我们得到了两个 `.o` 的二进制文件，最后只需交给链接器让它把这两个东西合并到一起（通过一系列复杂的流程），然后就得到了我们期望的可执行文件。

请注意这个过程，如果我的 `main` 函数发生了任何变化，我不需要重新编译任何 `String` 类的函数；反之，如果我更改了 `String` 类某些成员函数的实现，我也不需要重新编译 `main.cpp`。所以，将成员函数的声明和定义分离有助于加快项目编译的速度，有利于后期的维护。

**上面这几段看不懂没关系，不重要。**（但是如果你将来要学习一些贴近计算机底层的内容的话，我建议还是稍微留个印象比较好。）

> 类内定义和类外定义在 C++ 语言上的最大不同是它们的 *内联* 性质不同。类内定义的函数是 *内联* 的，而类外定义的默认不是（你需要手动加上 `inline` 关键词修饰才是 *内联* 的）。然而，函数的内联性并不代表它们编译出来的结果不同（因为内联只是容许多次重复定义而已）。有人说，内联的函数会提示编译器像[宏](appendix/preprocessor.md)一样处理这个函数，从而导致更快的执行速度和更大的二进制文件；然而这是不一定正确的：因为这样的处理方式也可能会导致丧失优化机会而让运行变慢，或者由于减少了大量的 `call push pop leave ret` 指令而减小了二进制文件的体积。C++ 标准委员会特意为此写了一篇[很长的文章](https://isocpp.org/wiki/faq/inline-functions)来回答内联函数的问题；然而结论是——都是玄学。所以我们这里只讨论在项目结构上类内定义和类外定义的区别。