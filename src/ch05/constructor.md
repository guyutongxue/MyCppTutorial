# 构造函数

<h6 id="idx_构造函数"></h6>

正如上一节结尾所属，**构造函数**（Constructor function）是为了解决初始化的问题而存在的。

我们定义的结构体在初始化的时候，可能需要根据初始化值的不同而做不同的操作。比如，在上一节的 `String` 结构体中，我们需要根据初始化字符串的长度来分配那么多大小的空间。为了实现这样的操作，我们不得不将初始化拆成两个部分：
1. 声明 `String` 类型变量；
2. 用一个值“初始化”这个变量，通过调用 `init` 成员函数。

即：
```cpp
String str;
str.init("Hello");
```

而利用构造函数，这个过程可以一步到位。使用构造函数（怎么使用之后会讲）后，初始化过程就变成这个样子：
```cpp
String str("hello");
```
只需要一条语句就够了。那么怎么写构造函数呢？方法很简单，只需要把 `init` 成员函数的名字改成结构体名 `String` 就可以了：
```CPP
#include <iostream>
#include <cstring>
struct String {
    char* str;

    // 原先的 void init(...) { ... }，将名字改成 String，去掉返回值类型说明
    String(const char* initVal) {
        len = std::strlen(initVal);   // 求出初始化字符串的长度，但这次赋值给成员变量
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal[i];
    }

    // 以下成员未做更改
    unsigned length() {
        return len;
    }
    void assign(const String assignVal) {
        delete[] str;
        len = assignVal.len;
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++) {
            str[i] = assignVal.str[i];
        }
    }

private:
    unsigned len;
};

// 然后就可以一行语句完成初始化：
int main() {
    String a("Hello"), b("Hi"); // 初始化
    std::cout << a.length() << std::endl;
    std::cout << b.length() << std::endl;
    b.assign(a); // 使用 assign 成员函数赋值，即 b = a
    std::cout << b.str << std::endl; // "Hello"
}
```

注意：构造函数是一种**非常特殊**的成员函数。它的名字必须和结构体名完全一致，而且不能写出返回值类型（`void` 也不用写）。即：
```sdsc-legacy
*结构体名* (**参数列表**) {
    **一些需要在初始化时执行的内容**
}
```
然后，你可以通过括号括起的 `@*参数列表*@` 作为初始化器进行初始化：
```sdsc-legacy
*结构体名* *变量名*(*参数列表*);
```

不过有一个例外：当构造函数的参数列表为空时，你不能这样初始化：
```CPP
#include <iostream>
struct S {
    int data;
    S() { // 无参构造函数
        std::cout << "constructor called." << std::endl;
    }
};
int main() {
    S a();  // 这样并不能声明并初始化 S 类型变量 a
//  a.data; // 错误
    S b;    // 解决方法：不加初始化器就能调用无参构造函数
    b.data; // 正确
}
```
上面的代码只能正确声明并初始化变量 `b`，而不能声明变量 `a`。这是因为形如 `T a();` 的语句实际上是一个函数声明——它引入了名为 `a` 的函数，不接受参数且返回值类型为 `T`。这种奇怪的、不符合直觉的行为被称为 C++ 中“最烦人的分析”。

最后让我们总结一下在初始化结构体时，我们已经学过的初始化器：
- [大括号初始化器](/ch04/struct/struct_def#idx_聚合初始化)：`@{*初始化值列表*}@`。此时，会将列表中的每个值按照成员声明的顺序逐一初始化；
- 小括号初始化器：`@(*初始化值列表*)@`。此时，会调用构造函数（细节见后续章节）。
- 无初始化器：若有无参构造函数，则调用构造函数；若为基础数据类型，则不进行初始化。

> 一旦出现一个构造函数，就只能用小括号初始化器而不能用大括号初始化器了。这是聚合初始化的限制。
>
> 在 C++20 中，两种初始化器事实上是可以混用的。

刚才说过，构造函数是非常特殊的成员函数，所以我们需要更多的章节来学习。下一节，我们将从重载的概念讲起，看看构造函数还能玩出什么花来。
