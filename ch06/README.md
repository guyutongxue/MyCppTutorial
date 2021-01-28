# 第六章 运算符重载

然而，C++ 作为一个相对来说非常基础的语言，想要富有条理、清晰易懂、简洁明了地讲完它的面向对象语法是不太可能的。接下来的知识内容将更加琐碎、凌乱，但我挑了其中一个比较有趣的知识点——运算符重载——为主线进行讲解；但这只是主线，我还会在其中穿插一些其它的小知识点。这些小知识点可能并不是那么有用，但是我必须要讲……而且说句不好听的，有些老师就爱考这个，那又有什么办法呢？

好了，废话不多说，我们先了解一下什么是运算符重载。还是用这个 `String` 举例。首先很普通地，我们加一个成员函数 `at`，它的作用是返回字符串的某一位。这个实现非常简单：
```cpp
class String {
public:
    char* str;
    // [...]
    char at(unsigned pos) {
        return str[pos];
    }
};
```

很好。然后我就可以很简单地读取到字符串的每一位：
```cpp
#include <iostream>
int main() {
    String a("Hello");
    std::cout << a.at(2) << std::endl; // 输出 'l'
}
```

接下来我们做一个很神奇的操作，把 `at` 函数名改成 `operator[]`：
```cpp
class String {
public:
    char* str;
    // [...]
    char operator[](unsigned pos) {
        return str[pos];
    }
};
```
然后这样？
```cpp
cout << a.operator[](2) << endl;
```
No no no，直接这样就可以：
```cpp
#include <iostream>
int main() {
    String a("Hello");
    std::cout << a[2] << std::endl; // 输出 'l'
}
```

你就可以用 `a[2]` 这种非常直观的写法了！也就是说，你为运算符 `[]` 增加了新的用法：当方括号外面是 `String` 里面是 `unsigned` 时，你就可以调用 `String` 的 `operator[]` 这个函数。

像这样，为已有的运算符添加新的含义，这和重载本质上是类似的。所以这种特性被称为**运算符重载（Operator overloading）**。在这个例子中，对于形如
```cpp
a[b]
```
的表达式，如果 `a` 是你自己定义的某个类（比如 `A` 类）的对象，那么你就可以在 `A` 的成员列表中写下这个函数定义：
```cpp
class A {
public:
    T operator[](B b) { // B 是 a[b] 中 b 的类型
        // [...] 做任何运算，返回任何类型
    }
};
```
然后 `a[b]` 就成为了合法表达式：对这个表达式进行运算的过程就是执行 `A` 的 `operator[]` 函数，然后将函数的返回值作为表达式的结果；也就是变成了
```cpp
a.operator[](b)
```

下一节开始我们将介绍其它的运算符重载，其中会涉及到更多的知识内容。