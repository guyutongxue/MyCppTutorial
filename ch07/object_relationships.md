# 简单的对象关系

## 部分于

第一种简单的对象关系称为“部分于”，也就是说 “B 是 A 的一部分”。这种关系是非常容易处理的，只需将 B 作为 A 的成员即可。比如：数学上分子和分母是分数的一部分，所以如果要设计分数类 `Fraction`，则可以：
```cpp
class Fraction {
private:
    int numerator;   // 分子
    int denominator; // 分母

public:
    Fraction(int numerator, int denominator) :
    numerator{numerator}, denominator{denominator} {
        reduce(); // 约分
    }
    // [...]
};
```
像这样，分子和分母作为分数类的成员而出现。又比如，一个学生拥有它的学号和姓名，那么就把它们放到成员列表里即可：
```cpp
class Student {
private:
    int number;
    std::string name;

public:
    std::string getName() { return name; }
};
```

## 有

下一种关系叫做“有”，也就是说“A 拥有 B”。这种关系最简单的处理方式是将指向 B 的指针作为 A 的成员。比如：一个班级拥有三十个学生，那么设计班级类的时候需要这样：
```cpp
class Student;
class MyClass {
private:
    Student* students[30];

public:
    Student& getStudent(int no) {
        return students[no];
    }

    // [...]
};
```

再比如一个人可以养最多三条狗，那么人和狗的关系则会这样实现：
```cpp
class Dog;
class Host {
private:
    Dog* dogs[3];
    unsigned num;

public:
    void addDog(const Dog& d) {
        if (num == 3) std::cout << "Already 3 dogs!" << std::endl;
        else dogs[num++] = &d;
    }
};
```

那肯定会有人问，“有”和“部分于”这两种关系感觉没什么区别啊？为什么一个就存放对象本身而另外一个却存放指向对象的指针呢？这是因为两种关系的区别在于某个确定的 A 是否**只属于一个** B。在“部分于”的例子中，A 总是归这一个 B 所“管”的：分子和分母都是这个分数的部分，而不能是其它分数的部分；学生的学号和姓名只属于它本人，而不能属于别人。但在学生-班级的示例中，一个学生可能会同时属于多个班级（小学班级、中学班级；或者分层教学之类的），甚至不属于任何一个班级；在主人和狗的示例中，一条狗可能会被多个主人“共同管理”，或者是条流浪狗。

从更形象的方面讲，“部分于”更注重于 B **单独**的使用。我们创建分数的时候不可能只创建分子或者只创建分母，我们总是创建一个整体的分数。但是“有”的关系让 A 的使用更加“独立”。我们可以先创建一个 A，然后让 B 的一个成员指向它。当 A 离开了 B（这个“有”的关系发生了变动），那么只需要改变指针的指向即可，而不需要再对已经创建好的 B 做任何操作。

> 从更现代的角度讲，应该使用 `std::reference_wrapper` 来存放对象的引用而非使用指针。但是 `std::reference_wrapper` 的使用我觉得现在讲有点太早了。

## 使用

所谓“使用”关系就是说 B 能用到 A （或 A 的某个部分）做事情。这种关系的处理方式实际上和“有”是一样的：B 存储指向 A 的指针。比如士兵可以用它的武器，那么：
```cpp
class Armament;
class Soldier {
private:
    Armament* arm;
};
```
它和“有”的区别就是使用的关系可以是双向的。就刚才的例子，你也可以说武器通过士兵来攻击——某种意义上，这个武器也“使用”了士兵：
```cpp
class Armament;
class Soldier {
private:
    Armament* arm;
    void setArmament(Armament& a);
};
class Armament {
private:
    const Soldier* holder;
public:
    void setHolder(const Soldier& s) {
        holder = &s;
    }
};
void Soldier::setArmament(Armament& a) {
    arm = &a;
    a.setHolder(*this);
}
```
于是你可以在武器类中也设置指向其使用者的指针。这样，两者之间可以通过指针相互访问其内容，这就是“使用”的实现了。

这种情形下你是必须使用指针的。如果两方面都存储对象本身而非指针，那么就会出现 `Soldier` 类中有 `Armament` 成员，而 `Armament` 又有 `Soldier` 成员……这样套娃的事情显然是错误的。