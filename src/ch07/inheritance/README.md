# 继承关系

继承关系指的就是“是”这种关系。比如，“学生是人”，那么就可以说学生和人之间是继承关系。为了演示继承关系的代码，我首先定义“人”的类描述：
```cpp
class Person {
    std::string name;
    int age;
public:

    // 简单的构造函数
    Person(const std::string& name, int age): name(name), age{age} { }

    int getAge() { return age; }
};
```
然后如果不考虑继承关系的话，学生拥有人的全部特征，而且还附带“学号”这个信息：
```cpp
class Student {
    // name 和 age 成员和 Person 一模一样
    std::string name;
    int age;

    int number; // 额外的学号信息
public:

    // 略微不同的构造函数
    Student(const std::string& name, int age, int number)
        : name(name), age{age}, number{number} { }

    // 和 Person 一样的成员函数
    int getAge() { return age; }
};
```

你会发现，`Student` 是 `Person` 在编程语言上的体现就是：`Student` 拥有所有 `Person` 的成员。所以，通过标记 `Student` 是 `Person` 这个关系，就可以删去 `Student` 中“`Person` 部分”的成员。而标记的方法是这个样子的：
```cpp
class Student : public Person {
    int number; // 额外的学号信息
public:

    // 略微不同的构造函数
    Student(const std::string& name, int age, int number)
        : /* 这里还不知道怎么写 */ { }
};
```

首先这段代码的最突出特点是：在第一行加上了 `: public Person`，然后成员列表中删去了那些重复 `Person` 的成员。所以它的含义就很明显了：`: public Person` 表明这个类和 `Person` 构成了“是”的关系。用更准确的语言说的话，就是 `Student` 类**继承**（Inherit）了 `Person` 类。

当类 `B` 以这种方式继承了类 `A` 的时候，`B` 拥有 `A` 的全部成员，也可以访问 `A` 的全部公开成员。
```cpp
class A {
private:
    int a;

public:
    int b;
    void f() { a++; }
};
// B 继承 A
class B : public A {
private:
    int c;

public:
    int d;

    void g() {
        b = 42; // 可以访问 A 的公开成员
        f();    // 调用 A 的公开成员函数
    }
};
int main() {
    B sth;
    sth.b; sth.d; sth.f(); sth.g(); // B 类型对象可以访问 A 或者 B 的公开成员
}
```

当 `B` 继承了 `A` 时，我们一般称 `A` 为基类（Base class），`B` 为派生类（Derived class)或者子类。

## 公开与私有继承

那么表示继承的写法 `: public A` 中的 `public` 是什么意思呢？它表明这个继承是“公开的”。公开的继承可以让基类的所有公开成员对外可访问，或者说基类的这些成员在派生类中是公开的。但如果这个继承是“私有的”，那么所有继承到的基类成员是不可对外访问的，或者说基类的这些成员在派生类中是私有的。换句话说，**继承的公开私有性决定了继承到的公开成员的公开私有性**。听起来还是很绕，看下面的例子：
```cpp
class A {
    int privateOfA;
public:
    int publicOfA;
};
class B : public A {
    void f() {
        publicOfA = 42; // OK
//      privateOfA = 42; // 编译错误，不存在此成员
    }
};
class C : private A {
    void f() {
        publicOfA = 42; // OK
    }
};
int main() {
    B b; C c;
    b.publicOfA; // OK
//  c.publicOfA; // 编译错误：不可访问私有成员
}
```

这里，`B` 公开继承了 `A`，同时 `C` 私有继承了 `A`。不同之处在于，`A` 的公开成员 `publicOfA` 在 `B` 里是公开的，所以 `b.publicOfA` 可以访问；但 `publicOfA` 在 `C` 里是私有成员，所以 `c.publicOfA` 编译错误。需要注意的是，基类的私有成员 `privateOfA` 在任何继承方式下都不可以在子类中访问。这也是其私有性的体现。（如果你必须要访问它，则需要设置友元关系。）

下面的表格整理了继承方式的区别。其中“保护成员”和“保护继承”两行两列可以暂时忽略，我们目前并没有讲解什么叫“保护成员”。一般地，**只有公开继承才能表达“B 是 A”这种关系**。

| 基类的……     | 公开继承（`public`） | 保护继承（`protected`） | 私有继承（`private`） |
| ------------ | -------------------- | ----------------------- | --------------------- |
| 公开成员将…… | 成为子类的公开成员   | 成为子类的保护成员      | 成为子类的私有成员    |
| 保护成员将…… | 成为子类的保护成员   | 成为子类的保护成员      | 成为子类的私有成员    |
| 私有成员将…… | 对子类不可见         | 对子类不可见            | 对子类不可见          |

最后总结一下类继承的写法：

```sdsc
("class"|"struct") 类名 ":" [访问说明符] 基类名 "{"
    [成员列表]
"}"
```

这里面，`@类名@` 继承了 `@基类名@`，其中 `@访问说明符@` 决定了继承的类别：`public` 表明其为公开继承，`private` 表明其为私有继承。另外，`@访问说明符@` 是可选的：如果派生类以 `struct` 声明则默认公开继承；如果派生类以 `class` 声明则默认私有继承。

