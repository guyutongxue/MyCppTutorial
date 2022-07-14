# 友元

终于，我们的 `String` 之旅马上就要结束了。目前最后一件需要做的事情就是把 `str` 成员改为私有的：因为唯一需要用到 `str` 的地方——输出已经通过非成员运算符重载解决了。
```cpp
class String {
private:
    unsigned len;
    char* str;

public:
    // 各种成员函数
};
std::ostream& operator<<(std::ostream& os, const String& b) { /* 定义略 */ }
```

但现在你会发现编译错误了：`operator<<` 这个**全局**函数用到了 `str` 成员。但 `str` 成员刚刚被设为私有的，所以 `operator<<` 并不能访问它。

然而把 `str` 暴露为公有成员着实有有点危险。所以这种情形下我们希望：有一些例外的函数，应当允许它们可以访问私有成员。C++ 确实提供了这样的语法：这些函数被称为**友元（Friend）函数**。

如果我们想允许函数 `f` 访问类 `A` 的私有成员，则要设置 `f` 为 `A` 的友元。设置方法很简单，只需要把 `f` 的声明抄一遍放在 `A` 的成员列表中，然后加上 `friend` 关键字修饰。在刚刚的场景下，我们就要把 `operator<<` 的声明抄一遍，加上 `friend` 放在 `String` 的成员列表中：
```cpp
class String {
private:
    unsigned len;
    char* str;
    // 照抄下来的声明 + friend 关键字
    friend std::ostream& operator<<(std::ostream& os, const String& b);

public:
    // [...]
};
// 函数定义保持不动
std::ostream& operator<<(std::ostream& os, const String& b) { /* 定义略 */ }
```

现在就没有编译错误了。需要注意的是，成员列表里 `friend` 开头的声明（称为友元声明）**不是**这个类的成员，所以访问说明符 `public:` 还是 `private:` 对其没有影响。

可以声明另一个类为友元：
```cpp codemo(show)
class A {
private:
    int privateMem;
    friend class B; // 友元声明
};
class B {
    void f() {
        A a;
        a.privateMem = 0; // 可以访问私有成员
    }
};
int main() { }
```
在这个例子中，类 `B` 被声明为类 `A` 的友元：方法很简单，把声明 `class B` 抄下然后加上 `friend`。

也可以声明另一个类的某个成员函数为友元：
```cpp codemo(show)
struct B {
    void f(); // 定义见下
};

class A {     // 这里需要 B 的定义，所以要放在 B 下面
private:
    int privateMem;
    friend void B::f(); // 友元声明
};

void B::f() { // 这里需要 A 的定义，所以要放在 A 下面
    A a;
    a.privateMem = 0;   // 可以访问私有成员
}

int main() { }
```
如果想要让 `B` 的成员函数 `f` 为 `A` 的友元，则需要写 `friend void B::f();`：除了前面加上 `friend` 以外，需要类似类外定义函数一样加上 `B::` 这个东西。然而为了让编译器知道 `B` 是个什么，你必须要把 `B` 的定义放在友元声明前面；另一方面为了让 `B` 中的 `f` 函数能用 `A` 的成员，你还要把 `B::f` 的定义放在 `A` 的定义后面。所以这种情形你恐怕必须要类外定义 `f`。

最后，介绍一种写法：你可以把友元函数的定义也放在类里面。
```cpp
class String {
private:
    unsigned len;
    char* str;
    // friend 关键字 + 函数定义
    friend std::ostream& operator<<(std::ostream& os, const String& b) {
        os << b.str;
        return os;
    }

public:
    // [...]
};
// 就不需要在全局定义 operator<< 了
```
这样做可以节省一些代码量，但这样很容易让人误以为 `operator<<` 是一个成员函数。然而事实并不是这样的，我们只是把它本来在全局的函数定义放到类里面去了而已：它没有 `this` 指针，访问说明符对其也没有影响。

> 虽然类内友元定义很容易让初学者感到困惑，但它在某些场合下有不可替代的作用，包括类模板、“隐藏友元”惯用手法等。
