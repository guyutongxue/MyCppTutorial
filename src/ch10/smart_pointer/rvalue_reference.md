# 右值引用

接下来我们要更深入了：请确保在阅读此节之前对以下值类别有一定程度的认识：
- 左值（可取地址）；右值（不可取地址）；
- 泛左值（有所关联的实体）；纯右值（没有被“求值”的裸表达式）；
- 亡值（泛左值+右值）。

如果没有，请再仔细阅读一下[之前这一节介绍](/ch10/smart_pointer/)。实在搞不明白可以发邮件问我看看。

## 移动语义

正因为所有的纯右值都没有身份，所以纯右值在它的整个生命中只会发挥一次作用——被用来作初始化器或者操作数的那一瞬间。这一瞬间也可能会发生临时量实质化，使得这个纯右值拥有非常短暂的实体。总之，纯右值或者亡值的特点就是转瞬即逝，用一次之后一般就再也用不上了。

我们将目光退回到第五、六章的自制 `String` 例子中。
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
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++) {
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

// codemo show
int main() {
    String a("abc"), b("def"), c;
    // codemo focus-next-line
    c = a + b;
    std::cout << c << std::endl;
}
```
这里的代码使用了 `c = a + b` 表达式。它本质上的执行过程是：先计算 `a + b`，也就是调用 `String::operator+` 函数：它返回的是 `String` 值类型，因此 `a + b` 是一个纯右值。然后它由于被用在了 `operator=` 右侧，下一步会绑定到 `const String&` 上，因此执行临时量实质化，实质化得到的实体就是 `operator=(const String& assignVal)` 里的参数 `assignVal`。

然后，`operator=` 照常执行，将 `a + b` 的资源（这里就是 new 出来的内存内容）复制到 `c` 里去。最后，`a + b` 会在整条语句执行完毕后释放（这个释放的时机将在稍后说明），刚刚被复制的内容立刻被释放。

仔细观察会发现，`a + b` 的资源被复制出去一次后就立刻释放了。结合这一部分的大标题“移动语义”，你就应该能知道我们更期望的是将这里的资源“移动”出去。具体来说，就是让 `c` 内的 `str` 指针指向这个临时的 `a + b` 实体内的 `str`。尽管这样会造成两个 `String` 对象共享资源；但没有关系，`a + b` 很快就会被释放掉，整条语句执行完毕后这个资源只有 `c` 持有。如果我们实现了这样一个赋值的语义，那就不会有额外的复制操作了。

## 右值引用的语法

右值引用可以用来实现移动语义。它利用的是这样一个前提：右值总是“短命”的，或者说右值用完这一次就应该释放了。因此，可以将它所持有的资源移动到别的地方去，比如 `operator=` 的左侧操作数。右值引用具有这样的语法：
```sdsc
类型"&&" 引用名[初始化器]
```

比左值引用多了一个 `&`。它的特点是：右值引用只能从右值初始化（或者说绑定到右值上）。此外，左值引用和右值引用就没有其它区别了；惟一的区别就是非只读的**左值引用只能从左值初始化，右值引用只能从右值初始化**。

如果一个引用能够从右值初始化，那么这个引用就相当于它刚刚绑定到的右值（其实已经实质化为亡值），对这个引用进行任何操作就相当于对被绑定的右值进行操作。因此我加入了这样的代码—— `String& operator=(String&&);`。
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
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++) {
            str[i] = assignVal.str[i];
        }
        return *this;
    }
    // codemo show
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
    // codemo hide

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
这个 `operator=` 重载接受一个 `String&&` 类型的形参，换句话说它所期望的实参是右值。当一个右值出现在 `operator=` 右侧时，这个重载就会被调用。

这个 `operator=` 里面交换了 `String&& assignVal` 和 `this` 指代的两个变量的资源。当交换完成后，`this` 也就是 `operator=` 左侧的对象就顺理成章地持有了原本右侧对象持有的资源；而右侧的临时对象现在持有的是（本应被覆盖的）原有资源。稍后 `b + c` 这个右值析构的时候，原有资源就跟着释放掉了。

这样的赋值重载称为**移动赋值重载**（Move assignment overload），类似的当然有**移动构造函数**了，代码如下：
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
    // codemo show
    String(String&& initVal) {
        len = initVal.len;
        str = initVal.str;
        initVal.str = new char[1]{'\0'};
        initVal.len = 0;
    }
    // codemo hide
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
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++) {
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

## 临时对象的生存期

本节的最后我来谈一下纯右值（准确地讲，其临时量实质化后的临时对象）何时析构。生存期这个概念我没有明确提及过，但是在[第四章](/ch04/list/storage_duration.md)里提到了对象的存储期，它们概念比较相似：总之就是讨论一个对象何时获取内存，何时初始化，何时析构并释放内存。

对于临时对象来说，它们宏观上是自动存储期的，所以初始化仍然在执行临时量实质化时发生。关键是析构发生的时刻：析构总是发生在这个纯右值所处的全表达式（Full expression）运算完成的位置。全表达式这个术语在标准中仅出现一次，定义略微复杂，但简单地理解成表达式语句或表达式所在语句执行完成的时刻点就可以。比如：

```cpp
String a, b, c;
(c = a + b), (a = b + c); // 全表达式完成之前，没有临时对象会析构
// 执行到此处时，a + b 实质化出来的对象被析构。同理 b + c 也在此时析构
```

这个规则不算漂亮，但在大部分的情形下是有用的，保证临时对象不会在使用完成前析构。但右值引用的存在让问题变得复杂：

```cpp
String a, b;
String&& r{a + b}; // 全表达式在此结束，a + b 析构了？
r; // 绑定到 a + b 的引用不合法了？
```

如果右值引用的语境下仍然坚守这条规则就坏了，这里的 `r` 立即就成为了悬垂引用。因此 C++ 又补充了这样的规则：任何绑定到纯右值的引用，会延长该纯右值的生存期（即延长其实质化后的对象存储期）。延长多久呢？到该引用语法上的生存期结束，简单来看就是该引用退出作用域的时刻。下面的例子具体地演示了这条额外规则：

```cpp
struct S {};
S f() {
    return {};
}
int main() {
    S* p{nullptr};
    {
        S&& r = f(); // 全表达式结束，f() 原本的析构点
        p = &r;
    } // 但由于绑定到引用 r，f() 生存期延长到此处结束，S::~S 在此处被调用
    // 此处 p 是悬垂指针，访问 *p 是未定义行为
}
```

> 此规则也包含 const T& 绑定到纯右值的情形，比如 `const int& x = 42;` 也会延长该临时对象 `42` 的生存期。如果引用从（非实质化生成的）亡值或左值初始化，除了某些特定形式的表达式，大多不会改变其原有的生存期。

这条规则还有例外（就你妈邪门，现在已经好几条例外规则了），函数返回右值引用不会延长生存期。此时的语义和返回左值引用是一致的，也就是遵循我们之前的[悬垂引用](/ch04/list/safety.md#悬垂引用)规则。

```cpp
struct S {};
S&& f() {
    return {}; // {} 的生存期不会被延长到函数调用结束。这就是悬垂引用
}
```

这个例子中，`{}` 是 `f` 的局部右值，它作为自动存储期就应该在 `f` 函数的存在期间被构造和析构。这是原则性的东西，因此返回右值引用虽然也是绑定到 `{}` 上，但生存期不会被延长。实际的经验表明：返回右值引用类型九成是错误，书写前一定要三思。

总之，右值引用最大的作用是让 `T& T::operator=(T&&)` 和 `T::T(T&&)` 这两个特殊成员函数能够从右值中“窃取”即将消失的资源。至于其它的，都是语法引入的额外噪声罢了，了解但不要放在心上（不然脑子会被搞乱的）。
