# 关于成员名

稍作停顿，我将在这一节中“科普”一下有关类的成员名的一些琐碎杂事。

## 一般的成员名

假设我现在类 `A` 下面有一个成员 `mem`。然后我会在 `main` 函数里创建一个 `A` 类型对象，然后访问它的 `mem` 成员：
```CPP
struct A {
    int mem;
};
int main() {
    A a;
    a.mem = 42;
}
```
这看上去非常普通。但你其实还可以这样写：
```CPP
struct A {
    int mem;
};
int main() {
    A a;
    a.A::mem = 42; // 这里多了一个 A::
}
```
这是因为 `mem` 这个名字其实是带“命名空间的”，它归类 `A` 这个“命名空间”所管（正式地说，它是类作用域 `A` 下的名字）。而我们在一般情况下想要访问某个命名空间的名字需要带上它所归属的命名空间名和作用域解析运算符 `::`：
```CPP
namespace Ns {
    int a;
}
int main() {
    Ns::a = 42;
}
```
这里面，`A::mem` 的道理是一样的。但在语义层面上，这个名字的存储期不是静态的——也就是说，它并不是像全局变量一样的存在，而是一个 `A` 类型对象的一部分。所以，直接使用这个名字在语义上是过不去的（不求值语境除外），需要通过一个成员访问运算符来指明是哪个对象的 `A::mem`：
```CPP
struct A {
    int mem;
};
int main() {
    A a;
    sizeof(A::mem); // OK，不求值的话还好
//  A::mem = 42;    // 需要求值的话会导致编译错误：要给哪个 mem 赋值？
    a.A::mem = 42;  // 告诉编译器：是给 a 的 mem 赋值
}
```

另一方面，我们知道静态成员是不归属任何一个变量的、类似全局变量一样的东西。这就是为什么对静态成员的访问可以直接用 `A::mem`。
```cpp
struct A {
    static int mem;
};
int A::mem{}; // 静态成员需要额外定义
int main() {
    A::mem = 42; // 静态成员不需要指定是“谁的”。它是“所有 A 类型对象共享的”
}
```

然而在没有继承语义的时候，`a.` 右侧的东西肯定是 `A` “命名空间”下的名字，所以实际上我们经常写的 `a.mem` 是省略了 `A::` 的 `a.A::mem`。

## 继承中的成员名

现在来看出现继承之后，成员访问表达式省略了什么、
```CPP
struct Base {
    int b;
};
struct Derived : Base { // 公开继承
    int d;
};
int main() {
    Derived a;
    a.b; // 这里略去的 b 的“命名空间”是谁？
    a.d; // 这里略去的 d 的“命名空间”是谁？
}
```

当然，正如刚才说的：既然 `a` 是 `Derived` 类型，省去的正是 `Derived::`：
```CPP
struct Base { int b; };
struct Derived : Base { int d; };
int main() {
    Derived a;
    a.Derived::b; // 确实是
    a.Derived::d;
}
```
不过除此之外，`a.b` 也可以写成 `a.Base::b`，但 `a.d` 不行：
```CPP
struct Base { int b; };
struct Derived : Base { int d; };
int main() {
    Derived a;
    a.Base::b; // 可以这样
//  a.Base::d; // 但这个不行
}
```
道理就是：`b` 也是 `Base` “命名空间”下的名字，而 `Base` 被 `Derived` 继承了，所以访问成员 `a` 也可以通过命名空间 `Base`。那么说这个的意义是什么呢？当基类和派生类出现了相同名字的成员时，这个“命名空间名”就体现出作用了：
```CPP
struct Base {
    int x;
};
struct Derived : Base {
    int x;
};
int main() {
    Derived a;
    a.x;          // 是 a.Derived::x 的省略版本
    // 但下面这两个意思不一样了！
    a.Derived::x; // 这个指第 5 行声明的那个成员
    a.Base::x;    // 这个指第 2 行声明的那个成员
}
```
注意到这里 `Derived` 类声明了一个和基类成员相同的名字 `x`。那么此时会发生类似[名字隐藏](/ch02/part3/scope#名字的隐藏)的效果——原先的 `Derived::x` 不再是从基类继承得来的，而是派生类重新声明的这个。

这个时候，`Derived::x` 的含义被重新定义了，但 `Base::x` 的含义却没有。所以，这时访问 `a.Base::x` 就更改了“基类部分的”那个 `x`，而通过 `a.Derived::x` 或者省略版本的 `a.x` 则更改的是“派生类部分的” `x`。

所以说，在派生类中使用和基类相同的成员名**并不会覆盖基类的成员定义**，仅仅是“隐藏”了这个定义。最终，这个派生类的布局中存在两个名字相同的成员，通过 `T::` 的形式可以区分它们。

## 类作用域下的 using 声明（选读）

之前我介绍过这样一种用法：
```CPP
#include <iostream>
using std::cout;
int main() {
    cout << "Hello" << std::endl; // cout 无需 std::
}
```
通过 using 声明将命名空间 `std` 下的名字 `cout` 导出到全局命名空间。既然类的成员也可以像命名空间一样处理，所以类的成员列表中也可以使用 using 声明。但这里，它的 `using` 只能从基类作用域中导出名字。
```cpp
struct Base {
    int mem;
};
struct Derived : Base {
    using Base::mem;
//  int mem; // 相同作用域不允许重复定义
    // [...]
};
```
然而这样做看上去并没有什么意义，只是说“手动”实现了成员的继承。它带来的最明显效果是 `Derived::` 作用域下的 `mem` 被这个 using 声明“占用”了，不能重复定义 `int mem;` 了。但这种写法更有意义的点在于，它允许派生类使用基类的同名成员函数重载。

```CPP
struct Base {
    void f() { }
};
struct Derived : Base {
    using Base::f;
    void f(int) { }
};
int main() {
    Derived d;
    d.f(); // 如果不写 using Base::f 则报错
}
```
在没有 using 声明的情况下，`d.f` 会单纯被解析为 `d.Derived::f`，即查找 `Derived` 作用域下都有哪些 `f` 的重载。然而，如果没有 using 声明，`Derived` 下只存在 `void f(int);` 一个重载，所有 `Base` 作用域的声明都被“隐藏”，那么 `d.f();` 就找不到合适的函数来调用，编译出错。但使用了 using 声明后，`Derived` 作用域下就存在了 `void f();` 这个声明，即让基类的重载集合注入到了派生类作用域下。

此外，这种 using 声明可将基类的保护成员导出：
```CPP
struct Base {
protected:
    int mem;
};
struct Derived : Base {
public:
    using Base::mem; // 将基类的保护成员导出为派生类的公开成员
};
int main() {
    Derived d;
    d.mem; // 如果删去 using 声明，则报错：保护成员不可在类外访问
}
```
