# 结构体的定义

结构体是由若干个数据“合起来”组成的一种新类型。这些数据被称为结构体的**成员（Member）**。若想定义一个新的结构体类型，你需要这样写：
```sdsc
struct *结构体类型名* {
    **成员列表**
};
```
其中，`@*结构体类型名*@` 是一个引入的类型名，它遵循和变量名相同的命名规则。`@*成员列表*@` 是一系列可选的带初始化器的声明，比如：
```cpp
struct Coordinate {
    int x, y;
    int z{42};
}; // 别忘了这有一个分号
```
定义了一个叫做 `Coordinate` 的新类型，它包含 `x` `y` `z` 三个 `int` 类型的成员。声明并定义一个结构体类型的变量也很简单，直接：
```cpp
Coordinate a;
```
和原来的写法是一样的。这里，`a` 的成员会这样初始化：若成员声明中带初始化器，则用初始化值初始化；若不带初始化器，则进行零初始化。比如这里 `a` 的 `x` 和 `y` 零初始化为 `0`，而 `z` 初始化为 `42`。

你在定义结构体类型变量时，也可以带一个初始化器。初始化器中是一系列由逗号分隔的值，它们会依次初始化每一个成员。比如：
```cpp
struct Student {
    unsigned int number;
    char name[30];
};
Student bob{12345, "Bob"};
```
这时，`bob` 的 `number` 成员被初始化为 `12345`，而 `name` 成员则被初始化为 `"Bob"`。

> 这是聚合初始化。能够使用聚合初始化的前提是没有显式给出的构造函数；然而在面向对象编程中这很罕见。所以在之后的学习中我们可能很少使用聚合初始化。

## 注意事项

我在这里建议读者，将结构体的定义写在全局作用域内。即：
```CPP
#include <iostream>
using namespace std;
struct Student {
    unsigned int number;
    char name[30];
};
int main() {
    Student bob{12345, "Bob"};
    cout << bob.name << endl;
}
```

这样做的原因是，我们可以在所有的函数中使用这个结构体类型：
```CPP
#include <iostream>
using namespace std;
struct Student {
    unsigned int number;
    char name[30];
};
void printName(Student student) {
    cout << student.name << endl;
}
int main() {
    Student bob{12345, "Bob"};
    printName(bob);
}
```
