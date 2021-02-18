# 继承关系

继承关系指的就是“是”这种关系。比如，“学生是人”，那么就可以说学生和人之间是继承关系。为了演示继承关系的代码，我首先定义“人”的类描述：
```cpp
class Person {
public: // 为了简便起见使用公有成员
    std::string name;
    unsigned age;

    // 简单的构造函数
    Person(const std::string& name, unsigned age): name(name), age{age} { }

    unsigned getAge() { return age; }
};
```
然后如果不考虑继承关系的话，学生拥有人的全部特征，而且还附带“学号”这个信息：
```cpp
class Student {
public:
    // name 和 age 成员和 Person 一模一样
    std::string name;
    unsigned age;

    unsigned number; // 额外的学号信息

    // 略微不同的构造函数
    Student(const std::string& name, unsigned age, unsigned number)
        : name(name), age{age}, number{number} { }

    // 和 Person 一样的成员函数
    unsigned getAge() { return age; }
}
```

