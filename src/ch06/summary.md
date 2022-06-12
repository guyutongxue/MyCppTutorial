# 总结

这一章，我们基于给 `String` 添加若干个操作符重载这件事情为主线，学习了一些琐碎的面向对象基础知识。作为总结，我将我们最终的 `String` 类代码呈现在下面。为了节约篇幅，我仍然采用了类内定义成员函数的写法。
```cpp
#include <cstring>
#include <iostream>
class String {
private:
    unsigned len;
    char* str;
    friend std::ostream& operator<<(std::ostream&, const String&);
    friend String operator+(const String&, const String&);

public:
    static constexpr unsigned npos{4294967295};

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

    char& operator[](unsigned pos) {
        return str[pos];
    }
    const char& operator[](unsigned pos) const {
        return str[pos];
    }
    String& operator+=(const String& b) {
        *this = *this + b;
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
    bool operator==(const String& rhs) const {
        if (len != rhs.len) return false;
        for (unsigned i{0}; i < len; i++) {
            if (str[i] != rhs.str[i])
                return false;
        }
        return true;
    }
    explicit operator bool() const {
        if (len == 0) return false;
        else return true;
    }

    unsigned length() {
        return len;
    }

    unsigned find(char c) {
        for (unsigned i{0}; i <= len; i++) {
            if (c == str[i]) return i;
        }
        return npos;
    }
};
String operator+(const String& a, const String& b) {
    char* newstr{new char[a.len + b.len + 1]};
    std::strcpy(newstr, a.str);
    std::strcpy(newstr + a.len, b.str);
    String result(newstr);
    delete[] newstr;
    return result;
}
std::ostream& operator<<(std::ostream& os, const String& b) {
    os << b.str;
    return os;
}
```

其中我略微更改了 `operator+` 的重载方式，使得其更合理。你也可以根据此代码增加更多功能或者重载其它运算符（比如根据字典序比较 `<` `>`）。但由于我们的内存分配方式很低效：每次赋值都需要释放空间重新分配；所以这个并不适合用在一般的场合。幸运的是，标准库提供了字符串类 `std::string` 供我们使用。

`std::string` 定义在头文件 `<string>` 中（注意不是 `<cstring>`！）。这个类定义了和我们类似的成员和运算符重载：
- 默认/复制构造函数；基于个数和某个 `char` 的构造；从 C 风格字符串构造；
- 复制赋值重载；`operator[]`；`operator+`；`operator+=`；`operator==`；
- 对 `std::cin` 和 `std::cout` 的支持：`operator<<` `opreator>>`；
- 求长度 `length()`；寻找字符出现位置 `find()`；

比如：

```cpp codemo(show)
#include <string>
#include <iostream>
int main() {
    std::string a("Hello"), b;   // 构造函数们
    std::cin >> b;               // 输入支持
    a += (" " + b);              // 各种运算符重载
    a[5] = ',';
    std::cout << b << std::endl; // 输出支持
}
```

它还定义了这些：
- 各种比较运算符重载（通过字典序比字符串大小）；
- 得到只读版本的 C 风格字符串 `c_str()`；
- 删除字符 `erase()`、替换字符 `replace()`、求子串 `substr()` 等等；

如果你感兴趣的话，可以参考[这些文档](https://zh.cppreference.com/w/cpp/string/basic_string)了解其定义的全部操作；本书不会在标准库内容上做过多停留。你只需知道，作为标准库的字符串类，它在算法上做了一定程度的优化，使得我们能够比较高效地利用它处理字符串问题。
