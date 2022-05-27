# 输出

## 字符、字符串

字符和字符串的输入十分复杂，但它们的输出却非常简单。

对于字符的输出，只需将其放在 `cout <<` 后面就行。
```cpp
char a{'@'};
cout << a << endl;   // 输出 char 型变量
cout << '#' << endl; // 输出 char 型字面量
```

对于字符串的输出，只需将存储字符串的字符数组放在 `cout <<` 后面就行。
```cpp
char a[]{"Hello"};
cout << a << endl;       // 输出字符数组中的字符串
cout << "world" << endl; // 输出字符串字面量（本质上也是一个字符数组）
```

唯一需要注意的就是字符数组只有是一个字符串的时候才能被正确地输出。所以这里要求字符数组必须有结尾的 `'\0'`；如果没有，`cout` 将会出现越界访问的情况，这是我们不想要的。
```cpp
char a[]{'H', 'e', 'l', 'l', 'o'}; // 缺少空字符结尾
cout << a << endl;                 // 导致错误
```
上面的代码可能输出 `Hello烫烫J秷[t?` 之类的乱码。

> 只有存储字符串的字符数组才可以这样输出，其它类型构成的数组无法直接输出。

## 整型、浮点类型

我们来学习一些关于输出整型和浮点类型的技巧。最简单的就是：
```cpp
int a{42};
cout << a << endl;
```
这样会输出 `42`。但是我们还有许多别的花样：

### 设置进制

我们默认输出整数时，用的是十进制。但是你还可以用八进制或十六进制，比如：
```CPP
#include <iostream>
using namespace std;
int main() {
    int a{42};
    cout << a << endl; // 十进制
    cout << oct;       // 调整 cout 为八进制
    cout << a << endl;
    cout << hex;       // 调整 cout 为十六进制
    cout << a << endl;
    cout << dec;       // 调回十进制
    cout << a << endl;
}
```
输出结果为：
```io
42
52
2a
42
```

### 设置精度

默认输出浮点数时，采取保留 6 位有效数字的策略。即：
```CPP
#include <iostream>
using namespace std;
int main() {
    double a{3.14159265359};
    cout << a << endl;
}
```
输出的是
```io
3.14159
```
我们可以通过 `cout.precision()` 这个函数来设置它输出的有效数字个数。比如我们改成 12 位有效数字试试看：
```CPP
#include <iostream>
using namespace std;
int main() {
    double a{3.14159265359};
    cout.precision(12);
    cout << a << endl;
}
```
结果很理想：
```io
3.14159265359
```

有时候，设置有效数字个数的意义不大，此时我们还改为设置小数点后多少位：只需加上一句 `cout << fixed;` 即可。
```CPP
#include <iostream>
using namespace std;
int main() {
    double a{12.3456789};
    cout << fixed;     // 设置精度方式调整为小数点后 n 位
    cout.precision(2); // 精度调到小数点后 2 位
    cout << a << endl;
}
```
此时的输出：
```io
12.35
```

如果想调回原先按有效数字的精度设置方式，则只需加上 `cout << defaultfloat;` 即可。

### 科学记数法

对于浮点数，你可以用科学记数法的方式输出，使用语句 `cout << scientific;` 即可。比如：
```CPP
#include <iostream>
using namespace std;
int main() {
    double a{12.3456789};
    cout << scientific;  // 设置为科学记数法输出
    cout << a << endl;
}
```
```io
1.234568e+01
```

同样地，用 `cout << defaultfloat;` 恢复默认输出格式。

## 布尔类型

默认输出布尔类型的时候输出的是 `0` 和 `1`：
```CPP
#include <iostream>
using namespace std;
int main() {
    cout << true << endl;
    cout << false << endl;
}
```
```io
1
0
```
所以如果你想要更易读的输出，请使用 `cout << boolalpha;` 语句：
```CPP
#include <iostream>
using namespace std;
int main() {
    cout << boolalpha;
    cout << true << endl;
    cout << false << endl;
}
```
这时，就会以文本形式输出：
```io
true
false
```

你可以用 `cout << noboolalpha;` 来取消这个设置。

## 设置宽度

考虑输出一个表格或者矩阵：
```CPP
#include <iostream>
using namespace std;
int main() {
    int a[3][4]{
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    for (int i{0}; i < 3; i++) {
        for (int j{0}; j < 4; j++) {
            cout << a[i][j] << ' ';
        }
        cout << endl;
    }
}
```
它的结果为：
```io
1 2 3 4
5 6 7 8
9 10 11 12
```
你会发现最后一行“凸出来了”，很不美观。这个时候，我们可以指定每一次输出的宽度为一个固定值，方法是 `@"cout.width("宽度");"@`。比如我们加上 `cout.width(2);`：
```CPP
#include <iostream>
using namespace std;
int main() {
    int a[3][4]{
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    for (int i{0}; i < 3; i++) {
        for (int j{0}; j < 4; j++) {
            cout.width(2);
            cout << a[i][j] << ' ';
        }
        cout << endl;
    }
}
```
你会发现，输出“对齐”了，因为每一个数都占了两个字符宽：
```io
 1  2  3  4
 5  6  7  8
 9 10 11 12
```
数会默认靠右对齐，左边补充空格。你可以用 `@"cout.fill("字符");"@` 来设置补充的字符，比如设置为 `cout.fill('0');` 就会出现下面的输出：
```io
01 02 03 04
05 06 07 08
09 10 11 12
```
需要注意的一点是，`cout.width()` **只能应用一次**输出。因此你需要在每次进行定宽度的输出前都要写上它。

> 你还可以通过 `cout << left;` 和 `cout << right;` 控制对齐方向。

## 其它

最后还有一些控制输出的常用语句，罗列于下：

| 语句                   | 作用                                   |
| ---------------------- | -------------------------------------- |
| `cout << showcase;`    | 显示八进制前缀 `0` 和十六进制前缀 `0x` |
| `cout << noshowcase;`  | 隐藏八进制前缀 `0` 和十六进制前缀 `0x` |
| `cout << showpoint;`   | 显示整型的小数点                       |
| `cout << noshowpoint;` | 隐藏整型的小数点                       |
| `cout << showpos;`     | 显示正数的 `+` 号                      |
| `cout << noshowpos;`   | 隐藏正数的 `+` 号                      |
| `cout << uppercase;`   | 使用大写字母（科学记数法或十六进制中） |
| `cout << nouppercase;` | 使用小写字母（科学记数法或十六进制中） |

> `cout.precision()` `cout.width()` 和 `cout.fill()` 也可通过 `cout << setprecision()` `cout << setw()` 和 `cout << setfill()` 的形式来控制。后三者被称为流操纵子，需要引入 `<iomanip>` 头文件。
