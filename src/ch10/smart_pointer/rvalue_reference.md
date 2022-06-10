# 右值引用

接下来我们要更深入了：请确保在阅读此节之前对以下值类别有一定程度的认识：
- 左值（可取地址）；右值（不可取地址）；
- 泛左值（有所关联的实体）；纯右值（没有被“求值”的裸表达式）；
- 亡值（泛左值+右值）。

如果没有，请再仔细阅读一下[之前这一节介绍](/ch10/smart_pointer/)。实在搞不明白可以发邮件问我看看。

## 移动语义

正因为所有的纯右值都没有身份，所以纯右值在它的整个生命中只会发挥一次作用——被用来作初始化器或者操作数的那一瞬间。这一瞬间也可能会发生临时量实质化，使得这个纯右值拥有非常短暂的实体。总之，纯右值或者亡值的特点就是转瞬即逝，用一次之后一般就再也用不上了。

```cpp codemo(focus=98)
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

int main() {
    String a("abc"), b("def"), c;
    c = a + b;
    std::cout << c << std::endl;
}
```

我们将目光退回到第五、六章的自制 `String` 例子中。这里的代码使用了 `c = a + b` 表达式。它本质上的执行过程是：先计算 `a + b`，也就是调用 `String::operator+` 函数：它返回的是 `String` 值类型，因此 `a + b` 是一个纯右值。然后它由于被用在了 `operator=` 右侧，下一步会绑定到 `const String&` 上，因此执行临时量实质化，实质化得到的实体就是 `operator=(const String& assignVal)` 里的参数 `assignVal`。

然后，`operator=` 照常执行，将 `a + b` 的资源（这里就是 new 出来的内存内容）复制到 `c` 里去。最后，`a + b` 会在整条语句执行完毕后释放（这个释放的时机将在稍后说明），刚刚被复制的内容立刻被释放。

仔细观察会发现，`a + b` 的资源被复制出去一次后就立刻释放了。结合这一部分的大标题“移动语义”，你就应该能知道我们更期望的是将这里的资源“移动”出去。具体来说，就是让 `c` 内的 `str` 指针指向这个临时的 `a + b` 实体内的 `str`。尽管这样会造成两个 `String` 对象共享资源；但没有关系，`a + b` 很快就会被释放掉，整条语句执行完毕后这个资源只有 `c` 持有。如果我们实现了这样一个赋值的语义，那就不会有额外的复制操作了。

## 右值引用的语法

右值引用可以用来实现移动语义。它利用的是这样一个前提：右值总是“短命”的，或者说右值用完这一次就应该释放了。因此，可以将它所持有的资源移动到别的地方去，比如 `operator=` 的左侧操作数。右值引用具有这样的语法：
```sdsc
类型"&&" 引用名[初始化器]
```

比左值引用多了一个 `&`。它的特点是：右值引用只能从右值初始化（或者说绑定到右值上）。此外，左值引用和右值引用就没有其它区别了；惟一的区别就是非只读的**左值引用只能从左值初始化，右值引用只能从右值初始化**。

```cpp codemo(focus=60-69)
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

    String& operator=(String&& assignVal) {
        // 交换两个 String 指向的内容...
        auto tempStr{str};
        str = assignVal.str;
        assignVal.str = tempStr;
        // ...以及它们的长度
        auto tempLen{len};
        len = assignVal.len;
        assignVal.len = tempLen;
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

int main() {
    String a("abc"), b("def"), c;
    c = a + b;
    std::cout << c << std::endl;
}
```

如果一个引用能够从右值初始化，那么这个引用就相当于它刚刚绑定到的右值（其实已经实质化为亡值），对这个引用进行任何操作就相当于对被绑定的右值进行操作。因此我加入了这样的代码—— `String& operator=(String&&);`。这个 `operator=` 重载接受一个 `String&&` 类型的形参，换句话说它所期望的实参是右值。当一个右值出现在 `operator=` 右侧时，这个重载就会被调用。

当这个重载被调用时，里面所做的代码是交换 `String&& assignVal` 和 `this` 指代的两个变量的资源。当交换完成后，`this` 也就是 `operator=` 左侧的对象就顺理成章地持有了原本右侧对象持有的资源；而右侧的临时对象现在持有的是（本应被覆盖的）原有资源。稍后 `b + c` 这个右值析构的时候，原有资源就跟着释放掉了。

```cpp codemo
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
    String(String&& initVal) {
        len = initVal.len;
        str = initVal.str;
        initVal.str = new char[1]{'\0'};
        initVal.len = 0;
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

    String& operator=(String&& assignVal) {
        auto tempStr{str};
        str = assignVal.str;
        assignVal.str = tempStr;
        auto tempLen{len};
        len = assignVal.len;
        assignVal.len = tempLen;
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

int main() {
    String a("abc"), b("def"), c;
    c = a + b;
    std::cout << c << std::endl;
}
```
这样的赋值重载称为移动赋值重载（Move assignment overload），类似的当然有移动构造函数了，代码就在这里。
