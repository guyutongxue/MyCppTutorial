# 布尔类型

**布尔类型（Boolean Type）**是用于存储“真”或“假”的变量。它一般用于存储数学上一个命题的真假。所以它的值只能为 `true` 或者 `false` ，其中 `true` 表示真， `false` 表示假。 `true` 和 `false` 都是 C++ 关键字。

> Boolean 一词是为了纪念英国数学家 George Boole。

布尔类型的类型说明符是 `bool` 。比如
```cpp
bool a{true};
```
声明并定义了布尔类型变量 `a` ，它的初始化值为 `true` 。

我们之前在 `if` 和 `while` 的条件中使用的就是布尔类型的结果。比如，条件 `3 > 7` 的结果就是布尔型变量 `false` ，因为这是一个假命题；而条件 `6 != 4` 的结果就是布尔型变量 `true` 。因此你可以直接把布尔型变量放入 `if` 或 `while` 的条件中。如：
```cpp
bool flag{false};
// do something...
if (flag) {
    // do something...
}
```

> 这里说的“条件”和“命题”都是形象的称呼，它们的标准说法是“表达式”。参见运算成分章节。

任何其它算术类型都可以赋值给布尔型变量。一般地，若该值为 `0` ，则赋值结果为 `false` ；若该值非 `0` ，则赋值结果为 `true` 。反过来，布尔型变量也可以赋值给其它算术类型。若布尔型变量为 `true` ，则赋值结果为 `1` ；若布尔型变量为 `false` ，则赋值结果为 `0` 。例如以下程序：
```cpp
#include <iostream>
using namespace std;
int main() {
    bool b1{true}, b2{false};
    cout.setf(ios_base::boolalpha); // 这句话用于以文本形式输出布尔类型，否则将输出 0 或 1
    cout << b1 << endl;
    cout << b2 << endl;
    b1 = 7 > 3; // 将布尔类型赋值给布尔类型
    b2 = -100;  // 将其它算术类型赋值给布尔类型。-100 非零，所以 b2 被赋值为 true
    cout << b1 << endl;
    cout << b2 << endl;
}
```
的编译运行结果为：

```io
true
false
true
true
```

> 布尔类型和其它算术类型相互赋值的时候发生了隐式转换。关于隐式转换的更多内容，参阅运算成分章节。

## 存储细节

C++ 标准没有规定布尔型变量的存储细节。但是一般地，布尔型使用 1 字节（8 位）存储，因为 1 字节是计算机能够操作的最小存储单位，相对是最节约空间的。当存储 `true` 时，该字节将存储为 $(00000001)_2$；当存储 `false` 时，该字节将存储为 $(00000001)_2$ 。

> 尽管 1 位是最小的存储单位，但是计算机所能操作的最小单位是 1 字节。请注意区分这两者之间的不同。

## 练习

1. 编写一个程序：输入 5 个数 ，如果其中存在一个大于等于 10 的数就输出 `NO` ；如果所有数都小于 10 就输出 `YES` 。

## 练习参考答案

```cpp
#include <iostream>
using namespace std;
int main() {
    int i{1}, x{0};
    bool isOK{true};
    while (i <= 5) {
        cin >> x;
        if (x >= 10) {
            isOK = false;
        }
    }
    if (isOK) {
        cout << "YES" << endl;
    } else {
        cout << "NO" << endl;
    }
}
```
