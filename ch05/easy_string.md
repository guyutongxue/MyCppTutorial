# 构造函数

回到面向对象的话题上来。根据本章最初的介绍，你应该已经了解到面向对象并不是什么特别高深的事情。当你向一个结构体中添加一些成员函数的时候，你已经在面向对象的路上了。

好的，这一节我们一起来运用这种思想实现一个字符串类。在第四章中，我们已经了解到一个 `char` 数组可以当做一个 C 字符串来使用。我们回顾一下：
```cpp
char str[30]{"Hello"};
```
此时，字符数组 `str` 成为了一个字符串。它的前六个元素被初始化为 `'H' 'e' 'l' 'l' 'o' '\0'`。其中，`'\0'` 表示字符串的终止。因此我们可以根据这个来写一个函数 `strlen` 求出字符串的长度：
```cpp
unsigned strlen(char* str) { // 传入 char* 类型和 char[] 类型是一样的
    unsigned i{0};
    while (str[i] != '\0') {
        i++;
    }
    return i;
}
```
然后，就可以：
```CPP
#include <iostream>
#include <cstring>
using namespace std;
int main() {
    char str[30]{"Hello"};
    cout << strlen(str) << endl;
}
```
得到字符串 `"Hello"` 的长度为 `5`。

> `strlen` 是标准库的函数，声明于头文件 `<cstring>`。所以我们不用自己定义就可以使用它。

现在我们尝试使用面向对象的思想来改进字符串——核心思想是，用一个结构体 `String` 来表示字符串。那么，可以这样做
```cpp
struct String {
    char str[30];
};
```
把字符数组 `str` 作为其中一个成员。然后，给它加一个 `length` 成员函数，求出字符串的长度：
```cpp
struct String {
    char str[30];
    unsigned length() {
        unsigned i{0};
        while (str[i] != '\0') {
            i++;
        }
        return i;
    }
};
```
然后，我们可以这样初始化一个字符串：
```cpp
int main() {
    String a{"Hello"};
}
```
关于结构体的初始化在 [结构体的定义](ch03/struct/struct_def) 提到，这里恰好让 `"Hello"` 初始化值初始化第一个成员 `str`。结构体中的函数不用初始化，会被忽略。

所以，整个代码变成了这个样子：
```CPP
#include <iostream>
using namespace std;
struct String {
    char str[30];
    unsigned length() {
        unsigned i{0};
        while (str[i] != '\0') {
            i++;
        }
        return i;
    }
};
int main() {
    String a{"Hello"};
    cout << a.length() << endl;
    String b{"Hi"};
    cout << b.length() << endl;
    b = a; // 结构体可以直接赋值、初始化（而“裸”数组不能赋值）
    cout << b.str << endl; // "Hello" 
}
```
看上去很不错，也能正确运行。但很显然，这段代码会发生潜在的问题。比如其中一个：
```cpp
int main() {
    String a{"veryveryveryveryveryveryveryveryveryveryveryveryveryveryverylongstring"};
}
```
如果初始化的长度太长，就会导致数组越界。嗯——这个问题解决起来可以很简单，就把 `str` 数组的大小变大就好了，比如大到 `char str[50];`。但保不齐之后会用到 `100` 位长的字符串，然后又不够了。所以仅仅增加 `str` 数组的大小并不是最完美的解决方案。

如果每次 `String` 被初始化的时候，总是能找到足够大的存储空间来放初始化值就好了。所以，[`new[]` 运算符](ch04/list/arr_new_del)可以帮助我们做这件事情。利用它，我们这样改进 `String` 结构体：
```cpp
struct String {
    char* str;
    void init(const char* initVal) {
        unsigned len = std::strlen(initval); // 求出初始化字符串的长度
        str = new char[len];                 // 分配这么大空间，将 str 指向它
        for (unsigned i{0}; i < len; i++)
            str[i] = initVal[i];             // 然后将这片空间逐个赋值
    }
}
```

