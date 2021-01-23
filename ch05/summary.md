# 总结

这一章，我们通过实现一个简单的 `String` 类，学习了面向对象的一些基础知识。下面给出目前 `String` 类的定义，回顾一下我们都做了什么：

```cpp
#include <cstring>
class String {
private: // 私有成员只有 len 。这一行可以删去，因为 class 默认是 private 的
    unsigned len;

public:  // 公开成员有 str 和一些函数
    char* str;

    // 构造函数一共有四个重载：
    // 重载 #1：默认（无参）构造函数，无需初始化器即可调用
    String() {
        len = 0;
        str = new char[1]{'\0'};
    }
    // 重载 #2：复制构造函数，为了实现“深复制”
    String(const String& initVal) {
        len = initVal.len;
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal.str[i];
    }
    // 重载 #3
    String(const char* initVal) {
        len = std::strlen(initVal);
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal[i];
    }
    // 重载 #4
    String(unsigned num, char c) {
        len = num;
        str = new char[num + 1];
        for (unsigned i{0}; i <= num; i++)
            str[i] = c;
        str[num] = '\0';
    }

    // 析构函数，保证内存不泄露
    ~String() {
        delete[] str;
    }

    // 之后是“普通的”成员函数
    // 求字符串长度
    unsigned length() {
        return len;
    }
    // 赋值用，原理也是“深复制”
    void assign(const String assignVal) {
        delete[] str;
        len = assignVal.len;
        str = new char[len];
        for (unsigned i{0}; i < len; i++) {
            str[i] = assignVal.str[i];
        }
    }
};
```