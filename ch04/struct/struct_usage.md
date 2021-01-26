# 结构体的使用

## 成员运算符

访问一个结构体的成员需要通过成员运算符 `.` 来实现：

| 运算符 | 名称       | 作用                                         |
| ------ | ---------- | -------------------------------------------- |
| `a.b`  | 成员运算符 | 当 `a` 是结构体类型时，访问名字为 `b` 的成员 |

比如：
```cpp
struct A {
    int b;
}
A a;
a.b;
```
我们已经见过太多次了。

## 用途

结构体的用途是多样的。我们最常见到的用法则是用结构体来创建一种新的类型 —— 比如之前的 `Student` 类型，这种类型可以用于存储一个学生的数据。

结构体变量的使用方法和普通变量是一致的。比如，结构体数组、用结构体作为函数参数：
```CPP
#include <iostream>
using namespace std;
struct Student {
    unsigned int number;
    char name[30];
};
// 打印学生信息的函数
void printStudentInfo(Student stu) {
    cout << "Name: " << stu.name << endl;
    cout << "No:   " << stu.number << endl;
}

int main() {
    Student classmates[3]{
        {10001, "Alice"}, // classmates[0]
        {10002, "Bob"},   // classmates[1]
        {10086, "Carol"}, // classmates[3]
    };
    for (int i{0}; i < 3; i++) {
        printStudentInfo(classmates[i]);
        cout << endl;
    }
}
```
你可以自己运行一下，看看它的输出是否和你想的一致。

又比如指向结构体类型的指针：
```CPP
#include <iostream>
using namespace std;
struct Student {
    unsigned int number;
    char name[30];
};
int main() {
    Student a{10001, "Alice"};
    Student* p{&a};
    cout << (*p).name << endl;
}
```
也是可以的。