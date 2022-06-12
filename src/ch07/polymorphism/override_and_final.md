# `override` 与 `final`

在本部分的最后，我们介绍两个为多态而设计的有特殊含义的标识符 `override` 和 `final`。

如果某个派生类的函数覆盖了基类的一个虚函数，那么可以为这个函数加上 `override` 标识来确认。比如：
````cpp codemo(show)
struct Base {
    virtual void f() { }
};
struct Derived : Base {
    void f() override { }
};
int main() { }
```
上面的例子在 `Derived::f` 的函数体前加上 `override` 一词，此时编译器便会做额外的检查，确保 `Derived::f` 可以覆盖虚函数 `Base::f`。这个检查可以帮助程序员在编译期间发现一些可能的错误。例如忘记将 `Base::f` 设置为虚的，或者 `Derived::f` 覆盖不了 `Base::f`，都会导致编译错误。
```cpp
struct Base {
    void f() { }
};
struct Derived : Base {
    void f() override { } // 编译错误
};
```

```cpp
struct Base {
    virtual void f(int x) { }
};
struct Derived : Base {
    void f() override { } // 编译错误
    //（以空参数调用 f 不是多态的：Base 中不存在接受空参数的虚函数 f）
};
```

如果确定某个虚函数应当是最终覆盖函数，即不能允许一个派生类覆盖它，那么可以将其用 `final` 标识符标识。
````cpp codemo(show)
struct A {
    virtual void f() { }
};
struct B : A {
    void f() final { } // 不允许覆盖 B::f
};
struct C : B {
    // void f() { }    // 编译错误
};
int main() { }
```

`final` 标识符还可用在类的声明中。此时，它的作用是标识不能存在此类的派生类。
````cpp codemo(show)
struct A final { };
// struct B : A { }; // 编译错误，A 不可被继承
int main() { }
```

由此可见这两个标识符总不是必须使用的：它们的作用不是提供新的语法，而是让编译器做更多的检查防止程序员出错。

> `override` 和 `final` 不是关键字：它们只是在上述场合中有特定用途。这意味着你可以将变量命名为 `override` 或 `final`，尽管这并不推荐。
