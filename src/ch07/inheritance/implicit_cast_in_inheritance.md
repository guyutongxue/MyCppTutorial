# 继承中的隐式转换

类的继承带来了许多隐式转换的可能。它们有的很直接，有的比较间接，有的稍不留意可能引发问题。

## 派生类到基类

一个公开继承的派生类对象可以“隐式转换”到其基类。

> 这里的“隐式转换”打上引号是因为，从派生类类型到基类类型这一过程并不是真正意义上的隐式转换。标准的说法是，在函数重载时（包括构造函数、赋值运算符等），如果实参为派生类，但期望形参为公开继承这个派生类的基类（正式而言，两个类型“引用兼容”（reference-compatible）），那么将把这个派生类的基类部分当做基类，然后调用这个重载。
> 
> 正因为从派生类到基类的“转换”并不是隐式转换，所以定义从派生类到基类的转换函数（如 `Derived::operator Base()`）是无效的，也不存在所谓的“隐式转换函数”。但凡尝试应用从派生类构造基类的场合会调用基类的复制构造（相当于从基类构造基类），尝试将派生类赋值到基类会调用基类的复制赋值重载。
> 
> （感谢知乎网友 @d41d8c 对此部分内容的补充。）

应用这个“隐式转换”的场合如下：
```CPP
class Base { };
class Derived : public Base { };
void f(Base b) { }
int main() {
    Derived d;
    Base b{d}; // 从派生类构造基类
    b = d;     // 将派生类赋值给基类
    f(d);      // 基类形参、派生类实参
}
```

## 基类引用绑定到派生类上

类似地，若派生类公开继承自基类，则基类引用可绑定到派生类对象上：
```CPP
class Base { };
class Derived : public Base { };
void f(Base& b) { }
int main() {
    Derived d;
    const Base& refb{d};
    f(d);
}
```
当然，即便这个引用绑定到了派生类，但它仍然只能访问基类的成员数据和成员函数。
```CPP
struct Base {
    int baseMem;
};
struct Derived : public Base {
    int derivedMem;
};
int main() {
    Derived d;
    Base& b{d};
    b.baseMem;    // OK
//  b.derivedMem; // 错误，即便它原本是派生类的
}
```

> 引用不是常规的对象类型（你无法定义到“引用”的转换），所以这只能算是引用绑定的语法设定，并不是隐式转换。

## 指针转换

唯一真正算得上是“隐式转换”的就是继承中的指针转换了。如果派生类公开继承自基类，则存在从指向派生类的指针到指向基类的指针的隐式转换。
```cpp
class Base { };
class Derived : public Base { };
void f(Base*);
int main() {
    Derived d;
    Derived* ptrd{&d};
    Base* b{d}; // 从 Derived* 类型隐式转换到 Base* 类型
    b = d;      // 同上
    f(d);       // 同上
}
```

这种隐式转换又称为**向上转型（upcast）**。

## 反之...？

刚才讨论了三种从派生类到基类的“转换”（对象本身、引用和指针），那么反过来是否可以呢？

- 不论显式或隐式，都不允许从基类对象转换到派生类对象（自己定义相关的转换函数除外）；
- 允许显式地将基类对象（或引用）转换到派生类引用类型（这允许将派生类引用绑定到基类对象上）；
- 允许显式地将指向基类的指针转换到指向派生类的指针。

其中后两种情况表明，在显式指出转换的情形下，允许进行从基类到派生类指针或引用的转换：
```CPP
struct Base { };
struct Derived : public Base {
    int derivedMem;
};
int main() {
    Base b;
    Base* ptrb{&b};
    Derived& refd{(Derived&)b};    // 显式地转换到 Derived& 类型
    Derived* ptrd{(Derived*)ptrb}; // 显式地转换到 Derived* 类型
    // 但是如果这个引用绑定或者指针指向的并不是真正的 Derived 类型对象，
    // 则访问 Derived 部分成员导致未定义行为：
    refd.derivedMem;  // 未定义行为：refd 没有真正绑定到 Derived 类型上
    ptrd->derivedMem; // 未定义行为：ptrd 没有真正指向 Derived 类型变量
}
```
这两种转换被称为**向下转型（downcast）**。但正如代码中所述，向下转型容易导致未定义行为，严重时会发生内存泄漏等问题。所以我们认为：没有保护的向下转型是危险的。之后，我们将在多态一节讲解如何安全地进行向下转型。