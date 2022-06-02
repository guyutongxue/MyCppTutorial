# 联合体 <sub>选读</sub>

联合体（Union type，又译共用体）类型是一种很奇怪的类型。在介绍其含义之前，我们首先来看联合体类型的声明方式：
```sdsc
"union" 联合体类型名 "{"
    [成员列表]
"};"
```
嗯，长得非常像结构体类型的声明，唯独把 `struct` 换成了 `union`。我们先仿照结构体的语法写一个联合体类型的例子：

```cpp
// 结构体
struct StudentStruct {
    unsigned int number;
    char name[10];
};
// 联合体
union StudentUnion {
    unsigned int number;
    char name[10];
};
```

但联合体和结构体总是不一样的类型。最明显的区别就是这两种类型的成员存储空间布局：

![struct-and-union](https://z3.ax1x.com/2021/07/12/WFQ2WD.png)

在结构体中，存储每个成员所用的空间都是独立的。在这个例子中，`StudentStruct` 整个结构体占 14 字节，第 1\~4 字节存放  `number` 成员，第 5\~14 字节存放 `name` 成员。但联合体不这样做。联合体的每一个成员都是**重叠**存放的——即它们的存储空间总是会互相影响。所以**整个联合体的大小只保证能够存放最大的那个成员**。在这个例子中，`StudentUnion` 总共只占 10 个字节，第 1\~4 字节存放第一个成员 `number`，第 1\~10 字节存放第二个成员 `name`。

这种设计导致了，如果我修改了 `number` 成员的值，那么 `name` 成员也会变；反之同理。这导致在某一时刻下，联合体的成员列表中只能保证仅有一个成员是可用的。
```cpp codemo(show)
#include <iostream>
using namespace std;
// 联合体
union StudentUnion {
    unsigned int number;
    char name[10];
};
int main() {
    StudentUnion u;
    u.number = 42;
    cout << u.number << endl; // OK，输出 42
//  cout << u.name << endl;   // 未定义行为

    u.name[0] = 'A', u.name[1] = 'l', u.name[2] = '\0';
    cout << u.name << endl;   // OK，输出 Al
//  cout << u.number << endl; // 未定义行为
}
```

> 不要写 `u.name = "Al"`，再三强调过数组不能赋值。你可以使用 `std::strcpy` 函数来代替。

在上面的例子中，我一旦给 `u.number` 进行了赋值，那么 `u.name` 的存储空间就遭到了污染，访问它的值会导致未定义行为。反之，我一旦给 `u.name` 进行了赋值，那么 `u.number` 的值则也是未知的。所以，联合体的内存重叠特性导致我在某一时刻要么只能保证 `u.number` 是我想要的，要么只能保证 `u.name` 是我想要的。这个唯一可用的成员被称为联合体的活跃成员（Active member）。

> 切换活跃成员的表达式具有形式 `@E1 "=" E2@`，其中 `@E1@` 是要切换到的活跃成员或者其下标、成员访问表达式。

有一种惯用手法称为带标签的联合体（Tagged union）。它利用枚举类型来更好地控制联合类型的使用，从而避免未定义行为。

```cpp codemo(show)
#include <iostream>
using namespace std;
// 用来记录活跃成员的标签
enum class RecordType {
    Number,
    Name
};
union StudentUnion {
    unsigned int number;
    char name[10];
};
struct Student {
    RecordType type;
    StudentUnion data;
};
int main() {
    Student u;
    // 赋值前设置标签
    u.type = RecordType::Number;
    u.data.number = 42;
    cout << u.data.number << endl; // OK，输出 42
    // 赋值前设置标签
    u.type = RecordType::Name;
    u.data.name[0] = 'A', u.data.name[1] = 'l', u.data.name[2] = '\0';
    cout << u.data.name << endl;   // OK，输出 Al

    // 仅当活跃成员为 number 时才输出
    if (u.type == RecordType::Number) {
        cout << u.data.number << endl;
    }
}
```

我通过额外添加一个 `RecordType` 枚举类型，来记录某个联合体当前时刻的活跃成员。使用的时候，将 `RecordType` 和 `StudentUnion` 用结构体打包在一起，然后在每次赋值（切换活跃成员）之前设置标签。这样，我只需要在访问联合体成员检查标签即可保证不触发未定义行为。

我们**不推荐**在 C++ 中使用联合体。

> C++ 为保证与 C 的兼容性，提供了匿名联合体语法。由匿名联合体形成的带标签联合体可以省去所有不必要的名字：

```cpp codemo(show)
#include <iostream>
using namespace std;
struct Student {
    enum {
        Number,
        Name
    } type;  // 略去枚举类型名，直接给出成员 type 的类型
    // Number 和 Name 位于 Student 作用域下，通过 Student:: 前缀访问
    union {
        unsigned int number;
        char name[10];
    }; // C 风格语法：匿名联合体，其成员注入到上层作用域；
    // 即可直接访问 Student::number 和 Student::name，保留内存重叠特性
};
int main() {
    Student u;

    u.type = Student::Number;
    u.number = 42;
    cout << u.number << endl;

    u.type = Student::Name;
    u.name[0] = 'A', u.name[1] = 'l', u.name[2] = '\0';
    cout << u.name << endl;

    if (u.type == Student::Number) {
        cout << u.number << endl;
    }
}
```
