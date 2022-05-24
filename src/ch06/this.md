# `this` 指针

## 为 `String` 重载 `+`

在上一节中我们为 `String` 重载了运算符 `[]`，含义是取出字符串的某一位。现在我们打算重载 `+` 这个运算符。它的含义是字符串拼接，也就是 `"abc" + "def"` 得到 `"abcdef"`。而类比之前重载 `[]` 的过程可以知道，
```cpp
a + b
```
中，当 `a` 是自定义的对象时，就相当于
```cpp
a.operator+(b)
```
即调用 `a` 的成员函数 `operator+`。那么，就来看一下 `operator+` 是怎么定义的吧：
```cpp
class String {
public:
    // [...]
    String operator+(const String& b) {          // 最好是 const T&，避免复制开销
        char* newstr{new char[len + b.len + 1]}; // 分配新的空间，大小为两个长度相加
        std::strcpy(newstr, str);                // 把 a 的字符串复制到新空间的前半段
        std::strcpy(newstr + len, b.str);        // 把 b 的字符串复制到新空间的后半段
        String result(newstr);                   // 从这个新空间建立新的 String 对象
        delete[] newstr;       // 现在可以删除新空间了（因为数据复制到 result 里去了）
        return result;         // 把 result 返回就可以
    }
};
```
这段代码相比之前要略微难理解一点。如果没有看懂，我建议你还是稍微多停留一会儿，争取搞明白它的工作原理。

然后就可以试一试：
```cpp
#include <iostream>
int main() {
    String a("abc");
    String b("def");
    // 下面调用了刚刚定义的 operator+
    String c(a + b);
    std::cout << c.str << std::endl;
}
```

然后，就能成功输出 `abcdef`。我们的 `+` 重载看上去很不错！

> 一个小细节：调用完 `operator+` 之后，还可能会复制构造函数来构造 `c`。说“可能会”的原因是，这里很可能会发生返回值优化从而避免复制开销。

## 为 `String` 重载 `+=`

下一步，我们尝试重载 `+=` 运算符。我们的目标很简单，就是比如当 `a` 为 `"abc"` 时，执行 `a += "def"`，然后 `a` 就变成了 `"abcdef"`。那么怎么做呢？方法也很简单：为了实现 `a += b`，只需要算出 `a + b`，然后把这个结果赋值给 `a` 就可以了。所以代码就这样：
```cpp
class String {
public:
    // [...]
    void operator+=(const String& b) {
        String result(operator+(b)); // 直接调用 operator+ 成员函数
        assign(result);              // 调用 assign 成员把结果赋值给自己
    }
};
```
这里直接调用了成员函数 `operator+` 来生成自己加上 `b` 得到的结果是什么，存放在对象 `result` 里。然后调用 `assign` 成员函数，把自己的值赋为 `result` 就可以了。测试一下：
```cpp
#include <iostream>
int main() {
    String a("abc");
    String b("def");
    a += b;
    std::cout << a << std::endl;
}
```
成功输出了 `abcdef`。但是这个其实还有一点小问题，就是对于“内置的”类型比如 `int`，它的赋值运算符是[有结果的](/ch02/part2/assignment_operator.md)。比如：
```CPP
#include <iostream>
int main() {
    int a{12};
    std::cout << (a += 30) << std::endl;
}
```
是可以输出 `42` 的（也就是把运算后的 `a` 作为赋值运算的结果值）。但是我们的实现做不到：
```cpp
#include <iostream>
int main() {
    String a("abc"), b("def");
    std::cout << (a += b).str << std::endl; // 错误：不许在表达式中运用 void 类型
}
```
那有人说，简单，就把刚才 `+` 完之后的结果返回就好了：
```cpp
class String {
public:
    // [...]
    String operator+=(const String& b) {
        String result(operator+(b));
        assign(result);
        return result;
    }
};
```
但这样其实还不对。因为“内置”的赋值运算是可以“连起来的”，但我们这个做不到。
```cpp
int main() {
    // 内置类型的表现
    int p{1};
    (p += 2) += 3;               // 相当于 a += 2; a += 3;
    std::cout << p << std::endl; // a 当前的值为 6 = 1 + 2 + 3
    // 接下来试试我们的
    String a("abc"), b("def");
    (a += b) += b;                   // 这句不会报错，但……
    std::cout << a.str << std::endl; // 输出为 "abcdef" 而非 "abcdefdef"
}
```
为什么连着两次赋值第二次就不行呢？请注意 `operator+=` 的返回值：它返回了一个 `String` 类型对象……但请思考一下，这个对象和 `a` 有关系吗？没有关系。也就是说，`(a += b)` 这个表达式确实得到了一个 `String` 对象，但它和 `a` 本身是没有任何联系的。那么，接下来对 `(a += b)` 在做 `+=` 运算，实际上是对这个孤零零的对象做赋值运算，这一次赋值并没有反映到 `a` 上。

所以我们的目标就是，让第二次赋值的操作对象是 `a` 而不是一个临时的对象。那么方法就是：让 `+=` 返回绑定到 `a` 的引用。
```cpp
class String {
public:
    String& operator+=(const String& b) { // 注意返回值类型
        // [...] 反正最终返回了绑定到 a 的引用（但我们还不知道怎么写）
    }
};
```
然后，再来看 `(a += b)` 是什么？回顾引用一词的含义，其实 `(a += b)` 是 `a` 的别名。所以，此时再对 `(a += b)` 做 `+=` 操作，就相当于对 `a` 做 `+=` 操作。那么我们的目标就实现了。

最后一个问题：怎么返回绑定到 `a` 的引用？这里就需要引入 `this` 关键字了。`this` 是在成员函数中可以用到的一个特殊变量名，在这里它是 `T*` 类型的，其中 `T` 是这个成员函数所归属的类型；作为一个指针，`this` 总是**指向调用这个函数的那个对象**。说来抽象，请看例子：

```CPP
#include <iostream>
struct A {
    int data;
    // 这个函数打印出 this 的值
    void printThis() {
        void* p{this};  // 实际上，this 在这里是 A* 类型的
        std::cout << p << std::endl;
    }
};
int main() {
    A a, b;
    std::cout << &a << std::endl;
    a.printThis();
    std::cout << &b << std::endl;
    b.printThis();
}
```
比如它输出
```io
0x61fe1c
0x61fe1c
0x61fe18
0x61fe18
```
那么很显然，当 `a` 调用 `printThis` 时，打印出的就是 `a` 的地址 `&a`；当 `b` 调用 `printThis` 时，打印出的就是 `b` 的地址 `&b`。所以基于此，我们就可以构造绑定到 `a` 的引用：
```cpp
class String {
public:
    // [...]
    String& operator+=(const String& b) {
        String result(operator+(b)); //
        assign(result);
        // 这里，this 指向的就是调用 `operator+=` 的调用者 a ，而 *this 就是 a 本身了
        return *this;
    }
};
```
也就是 `*this`。接下来再试试之前的代码，相信你就能得出正确的结果了。

> 在[只读成员函数](/ch06/const_member_function.md)中，`this` 是 `const T*` 类型的。严格来讲，`this` 应当具有顶层只读限定（即不可以更改 `this` 的指向，其类型为 `T* const` 或 `const T* const`），但文中出于行文简便没有考虑它。
