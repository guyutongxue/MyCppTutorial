# 派生类的构造

上一节中遗留了一个问题没有解决，就是派生类的构造函数初始化列表仍然没有写出来：
```cpp
class Person {
    std::string name;
    int age;
public:
    Person(const std::string& name, int age): name(name), age{age} { }
};

class Student : public Person {
    int number;
public:
    Student(const std::string& name, int age, int number)
        : /* 这里写什么？ */ { }
};
```

如果我们想当然地写：
```cpp
Student(const std::string& name, int age, int number)
    : name(name), age{age}, number{number} { }
```
编译器会抱怨 `name` `age` 不是成员名。确实，它们不在 `Student` 的成员列表中，但它们是基类 `Person` 的成员啊。那么怎么初始化基类成员呢？

思路是这样的：基类成员属于基类的一部分，所以它们的初始化工作应当交给基类进行。正确的写法是这样的：
```cpp
Student(const std::string& name, int age, int number)
    : Person(name, age), number{number} { }
```
这里，`Person(name, age)` 表示，用实参列表 `name, age` 调用 `Person` 的构造函数，从而初始化 `Person` 部分的成员。

如果用更形象的说法就是，一个类的基类代表了一个“成员集合”，而这个基类重载的若干个构造函数定义了这个“成员集合”的初始化方法。所以，在初始化列表中，基类的出现场合和其它成员是完全一致的——就相当于一个更“大”的成员。

我将在这一部分的结尾整理有关预置函数的细节，届时你可以更加深刻地理解“基类就是成员集合”这一说法。

> 类似地，你可以想象：这个类自己就是所有成员的一个大集合。所以类本身的名字也可以出现在构造函数的初始化列表中。这种在初始化列表中调用自身的构造函数的行为称为委托构造。委托构造不能出现递归。

## 派生类构造顺序与析构顺序

派生类在执行构造和初始化时，按照以下顺序执行：
1. 构造基类部分的成员。如果初始化列表中提供了基类构造方法，则调用对应构造函数；否则默认初始化基类（部分的成员）；
2. 按照初始化列表或者默认初始化器对派生类“额外的”成员进行构造。若无，则默认初始化；
3. 执行构造函数。

可以注意到，派生类构造的方法比没有继承关系的类多了“构造基类”这一步。构造基类这件事情发生在最开始，然后才会执行成员的初始化和构造函数的执行。下面的代码演示了这三步构造的顺序：

```cpp codemo(show)
#include <iostream>
class Base {
public:
    Base() { 
        std::cout << "Base constructor" << std::endl;
    }
};
class Member {
public:
    Member() {
        std::cout << "Member constructor" << std::endl;
    }
};
class Derived : public Base {
    Member member;
public:
    Derived() {
        std::cout << "Derived constructor" << std::endl;
    }
};
int main() {
    Derived d;
}
```

类的析构顺序一般和其构造顺序是相反的。这里，典型的析构顺序是：
1. 执行析构函数；
2. 析构成员：顺序与构造（初始化）相反；
3. 析构基类。

派生类相比普通的类多了“析构基类”的操作，而这一步是发生在最后的。这也和我们的直观相吻合。
