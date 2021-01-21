# 重载

## 重载

我们先把面向对象的话题放在一边，来看一看 C++ 的重载（Overload）机制。假设我有一个函数 `printInt`，它可以打印出一个整数的值：
```cpp
void printInt(int i) {
    std::cout << "Print an integer: " << i << std::endl;
}
```
然后我又有一个函数 `printFloat`，它可以打印出一个浮点数的值：
```cpp
void printFloat(double f) {
    std::cout << "Print a float: " << f << std::endl;
}
```
又比如还有一堆这样类似的函数：
```cpp
void printChar(char c) {
    std::cout << "Print a character: " << c << std::endl;
}
void printCString(const char* s) {
    std::cout << "Print a string: " << s << std::endl;
}
```
那么，如果我要使用这些函数，我需要根据我要输出的数据类型来选择对应的函数名字：
```cpp
int main() {
    printInt(42);
    printFloat(3.14);
    printChar('@');
    printCString("Hello");
}
```
而 C++ 的重载机制就是说，像这样功能类似，但**参数不同**的函数们可以共用一个名字。比如：
```CPP
#include <iostream>
// 以下四个函数名字都是 print，但接受的形参类型不同
void print(int i) {
    std::cout << "Print an integer: " << i << std::endl;
}
void print(double f) {
    std::cout << "Print a float: " << f << std::endl;
}
void print(char c) {
    std::cout << "Print a character: " << c << std::endl;
}
void print(const char* s) {
    std::cout << "Print a string: " << s << std::endl;
}
int main() {
    // 调用时，编译器会根据实参类型选择对应的函数
    print(42);
    print(3.14);
    print('@');
    print("Hello");
}
```

这就是重载机制的体现了。我们有时会这样说，上面代码中 `print` 函数有 4 个重载；某一行函数调用语句调用了第几个重载。

再举一个更实际的例子。我们有如下求最大值的函数：
```CPP
int max(int a, int b) {          // 第一个重载
    return a > b ? a : b;
}
double max(double a, double b) { // 第二个重载
    return a > b ? a : b;
}
int max(int a, int b, int c) {   // 第三个重载
    int ab = max(a, b); // 不是递归，是调用第一个重载
    return ab > c ? ab : c;
}
int main() {
    max(42, 56);     // 调用第一个重载 int max(int, int);
    max(3.14, 2.73); // 调用第二个重载 double max(double, double);
    max(4, 5, 6);    // 调用第三个重载 int max(int, int, int);
//  max(42, 3.14);   // 编译错误：无法判断哪一个重载
}
```
这里，`max` 函数拥有三个重载，然后 `main` 函数中依次调用这三个重载。编译器会根据实参的类型和个数来判断应该调用哪一个重载。但第 15 行的调用会导致编译错误，因为实参列表 `(42, 3.14)` 有歧义：它到底对应 `(int, int)` 这个重载，还是 `(double, double)` 呢？在这种情形下，编译器在会采用隐式转换更“少”的方案。然而此时两个重载都需要一次隐式转换，它们是等同的。这时，编译器就会给出一个错误，告诉说 `max(42, 3.14);` 这条语句有歧义。

编译器确定重载的这个过程实际上是非常[复杂且晦涩难懂](https://zh.cppreference.com/w/cpp/language/overload_resolution)的。因此我们并不建议在函数调用语句时发生隐式转换。

最后需要注意的就是，重载是指若干个同名函数定义可以拥有不同的参数列表。如果两个函数定义只有返回值类型不同，而形参列表却一样，那显然编译器不可能通过实参类型来判断调用哪一个重载。

## 构造函数重载

成员函数和普通函数一样，也可以拥有多个重载。所以构造函数作为特殊的成员函数，也可以接受多个重载。

回到之前的 `String` 结构体。我们已经有了这样的构造函数：
```cpp
struct String {
    String(const char* initVal) {
        len = std::strlen(initVal);
        str = new char[len];
        for (unsigned i{0}; i < len; i++)
            str[i] = initVal[i];
    }
    // [...]
};
```
我们首先添加这样一个重载
```cpp
String(unsigned num, char c);
```
这样，构造出一个 `num` 位长的字符串，每一个字符都是 `c`。它的实现是：
```cpp
struct String {
    String(unsigned num, char c) { // 新的重载（#1）
        len = num;
        str = new char[num];
        for (unsigned i{0}; i < num; i++)
            str[i] = c;
    }
    String(const char* initVal); // 同上（#2）
    // [...]
};
```
然后在 `main` 函数中调用这个新添加的重载：
```cpp
int main() {
    String a(5, "x");  // 调用重载 #1
    String b("Hello"); // 调用重载 #2
    std::cout << a.str << std::endl; // "xxxxx"
    std::cout << b.str << std::endl; // "hello"
}
```
你可以验证它成功输出了我们想要的结果。

类似地，我们再添加一个无参的构造函数重载——它构造出一个空字符串 `""`：
```cpp
struct String {
    String(unsigned num, char c); // 同上，重载 #1
    String(const char* initVal);  // 同上，重载 #2
    String() {                    // 重载 #3
        len = 0;           // 空字符串长度为 0
        str = new char[0]; // 嘛，先不用太管这句
    }
}
```

> 为了简便起见，这里我使用了 `new T[0]` 的语句形式。正如[这一节](ch04/list/arr_new_del)结尾所述，这是合法语句，但需要被 `delete[]`。

随后，我们可以这样使用：
```cpp
int main() {
    String a(5, "x");  // 调用重载 #1
    String b("Hello"); // 调用重载 #2
    String c;          // 调用重载 #3
//  String c();        // 不是 String 对象声明，见上节
}
```
即：当没有初始化器的时候，就会选择无参的构造函数重载。