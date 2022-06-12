# 复制构造函数

## `const T&`

这一节开头，仍然先抛开面向对象不谈。假想我们有一个特别大的结构体：
```cpp
struct HugeStruct {
    double data[512][512]{}; // 特别大！
};
```
然后我们还有一个函数 `check`，只用来检查一个 `HugeStruct` 类型变量是否满足某个要求：
```cpp
bool check(HugeStruct a) {
    // 做一些事情
    return /* sth */;
}
```
最后我们在 `main` 函数中调用：
```cpp
#include <iostream>
struct HugeStruct;      // 定义见上
bool check(HugeStruct); // 定义见上
int main() {
    HugeStruct hs;
    // [...] 对 hs 做一些操作
    if (check(hs)) {
        std::cout << "Ok" << std::endl;
    }
}
```
这一切看上去很不错。但是回想[函数执行](/ch03/function_execution)的过程，我们在调用 `check` 函数的过程中发生的参数传递是“复制”的——也就是说，这段程序需要将一个很大的数据从 `main` 的内存复制到 `check` 的内存：
```sdsc
"HugeStruct a{"main 函数中的 hs"};"
```

然而，如此巨大开销的复制仅仅是为了做一些检查。那么我们为什么不直接检查 `main` 函数中的 `hs` 呢？于是我们可以将 `check` 函数的参数类型改为引用：
```cpp
bool check(HugeStruct& a) {
    // [...]
    return /* sth */;
}
```
此时，参数传递发生的是：
```sdsc
"HugeStruct& a{"main 函数中的 hs"};"
```
也就是说 `a` 只是 `main` 函数中 `hs` 的一个别名，而起别名这个操作是不需要复制任何数据的。所以，**传递引用可以通过减少复制来提高性能**。

然而传递引用参数带来的另外一个问题是，如果 `check` 函数“不小心”对 `a` 做了改动怎么办？在原先不传递引用的版本中，如果这些“不小心的改动”发生并不会影响到 `main` 中 `hs` 的变化；但传递引用后这些变化就会立刻反映到 `main` 中，导致意想不到的结果。所以，我们的解决方法是在引用声明中加上 `const` 限定防止其更改：
```cpp
bool check(const HugeStruct& a) {
    // [...] 这里不可能对 a 进行修改
    return /* sth */;
}
```
这就是从直观层面上，`const T&` 这种形式声明的理解。不过实际上，`const T&` 是作为一种“[左](/ch04/pointer/pointer_usage#idx_左值)右通吃”的引用而存在的。我们这里不做更多展开，如果感兴趣可以尝试理解下面的代码：

````cpp codemo(show)
void passByVal(int a) {}
void passByRef(int& a) {}
void passByConstRef(const int& a) {}
int main() {
    int x{42};          // x 是左值，42 是右值
    passByVal(x);       // 值传递左值，OK 但有复制开销
    passByVal(42);      // 值传递右值，OK 但有复制开销
    passByRef(x);       // 引用传递左值，OK
//  passByRef(42);      // 引用传递右值，编译错误
    passByConstRef(x);  // “只读引用”传递左值，OK
    passByConstRef(42); // “只读引用”传递右值，OK
}
```

## 复制构造函数

有一个非常重要的构造函数称为复制构造函数，长成这样：
```cpp
T(const T&);
```

也就是接受 `const T&` 类型的参数，其中 `T` 恰好是自己。它的特殊之处是，在需要做“复制”的操作时会调用这个构造函数。这样说起来很抽象，请看下面的例子：
````cpp codemo(show)
#include <iostream>
struct S {
    int data;
    S(int d) {      // 构造函数重载 #1
        data = d;
    }
    S(const S& s) { // 构造函数重载 #2，复制构造
        std::cout << "copy constructor called" << std::endl;
    }
};
void f(S a) { }
int main() {
    S sth(42); // 调用重载 #1
    f(sth);
}
```
你可能会很意外地发现程序输出了 `copy constructor called`。我们明明没有手动调用过这个重载，为什么会输出东西呢？原因就在 `f(sth);` 这个函数调用上。因为这个函数是按值传递的，所以正如之前所说，它会经过一次复制的操作，把数据从 `main` 的内存拷到 `f` 的内存。而这次复制就是通过调用重载 `#2` 来实现的。也就是说，参数传递如同：
```sdsc
"S a("main函数中的 sth");"
```

类似地，在函数返回时也*可能*会发生值的复制。假设下面的场景：
```cpp
S g() {
    S sth(42); // 调用重载 #1
    return sth;
}
int main() {
    S a(36); // 调用重载 #1
    a = g(); // 返回值时调用重载 #2
}
```
那么这段函数*可能*同样会输出 `copy constructor called`。这是因为，`g()` 这个表达式的结果需要从 `g` 的内存复制到 `main` 的内存，此时需要调用复制构造函数。但是，这种情形经常会被优化——编译器有时会直接在 `main` 的内存完成所有的任务从而避免复制。这种优化称为“具名返回值优化”（Named Return Value Optimization, NRVO）。

> 对于 g++ 和 clang++ 编译器，启用 `-fno-elide-constructors` 开关来避免具名返回值优化。但非具名（匿名）的返回值优化是 C++17 所[要求](https://zh.cppreference.com/w/cpp/language/copy_elision)的。

> 事实上，形如 `T(T&);` `T(volatile T&);` `T(const volatile T&);` 的构造函数都是复制构造函数。但不带 `const` 限定的复制构造参数是各种意义上违反直觉的，所以我们并不推荐。
