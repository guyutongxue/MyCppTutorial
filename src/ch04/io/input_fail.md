# 输入失败状态

当 `cin` 读取到的东西和它所期望的不符合时，就会进入失败状态。比如这些操作：

#### 一、期望读取一个整数，却没有输入整数：
```cpp
#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
}
```
```io
**Hello!↵**
```

类似地，期望读取一个浮点数，却没有输入浮点数也会进入失败状态。

#### 二、读取到了长度过长的字符串：

```cpp
#include <iostream>
using namespace std;
int main() {
    char a[10]{};
    cin.getline(a, 10);
}
```
```io
**Hello! I am really really longer than the limit.↵**
```

当发生这种现象的时候，就会导致输入失败。输入失败会导致**接下来的任何输入语句都会跳过执行**，如：
```CPP
#include <iostream>
using namespace std;
int main() {
    int n{42};
    cin >> n; // 这里不输入整数时就会发生失败
    int m{42};
    cin >> m; // 若输入 n 时发生失败，则此行输入被跳过
    cout << m;
}
```
```io
**Hello! 66↵**
42
```

## 判断是否失败

那如何判断 `cin` 是否处于失败状态呢？你可以使用 `cin.fail()` 这个函数来得知。它是一个接收无参数、返回布尔类型的函数，指明 `cin` 是否失败。比如：
```CPP
#include <iostream>
using namespace std;
int main() {
    int n{42};
    cin >> n;
    if (cin.fail())
        cout << "cin failed." << endl;
    else
        cout << "OK." << endl;
}
```
```io
**Hello!↵**
cin failed.
```
```io
**56↵**
OK.
```

## 清除失败状态（选读）

正如前文所述，当 `cin` 处于失败状态时，拒绝接下来的任何输入语句。因此我们需要清除这个输入失败状态，方法是调用 `cin.clear()` 这个函数。

但是仅仅清除失败状态时不够的，因为缓冲区中那些不符合期望的错误输入并不会清除掉（比如上例中输入的 `"Hello!"` ）。因此同时还需要写一个很复杂的语句来做这件事情：
```cpp
// 可能需要 #include <limits>
// 清除缓冲区到第一个换行符为止
cin.ignore(numeric_limits<streamsize>::max(), '\n');
```

下面的例子演示了完整的用法：

```CPP
#include <iostream>
using namespace std;
int main() {
    int n{42};
    cin >> n;
    if (cin.fail()) {
        cout << "cin failed." << endl;
        cin.clear(); // 清除失败状态，使 cin 恢复正常
        cin.ignore(numeric_limits<streamsize>::max(), '\n'); // 清除缓冲区一行字符
    }
    int m;
    cin >> m;
    cout << m << endl;
}
```
这样 `m` 就能被输入了：
```io
**Hello!↵**
cin failed.
**56↵**
56
```

## EOF

<h6 id="idx_文件末尾"></h6>

上文中提及了两种可能导致输入失败的情形：输入格式错误和输入长度超限。除此之外，还有一种常见的错误，称为达到**文件末尾（End of file, EOF）**错误。

为了解释这个错误，首先要了解一些背景知识。在目前的学习阶段，我们经常接触的输入输出方式可能是在控制台中，通过键盘向程序输入信息，通过显示屏输出信息。然而在现实的应用中，更常使用的是文件输入输出。也就是说，C++ 程序将从一个文件读取输入，并将信息输出到另外一个文件中去。

> 本教程所提供的[在线编译运行](https://guyutongxue.gitee.io/cppocui)功能实际上就是基于文件输入输出的。

然而在文件输入中可能出现一个问题。比如本来期望输入两个数，但是文件中只有一个数：也就是输入第二个数的时候意外地抵达了文件的末尾。这就是 EOF 错误了，也就是没有更多的数据可供继续读取的意思。

下面的例子演示了 EOF 错误：

```CPP
#include <iostream>
using namespace std;
int main() {
    int a{0}, b{0};
    cin >> a >> b;
    if (cin.fail())
        cout << "cin failed." << endl;
}
```
本来要求输入两个数，但如果输入文件中只有一个数
```io
**42**
```
那么就会导致 `cin` 进入失败状态：
```io
cin failed.
```

其实，如果没有使用文件输入输出，也可以模拟文件结束（可能有少数环境不支持）。你只需要在键盘上按下这些按键即可：

| Windows                                                               | macOS                                               | GNU/Linux           |
| --------------------------------------------------------------------- | --------------------------------------------------- | ------------------- |
| 依次按下：<br><kbd>Enter</kbd>，<kbd>Ctrl + Z</kbd>，<kbd>Enter</kbd> | 依次按下：<br><kbd>Return</kbd><kbd>Control+D</kbd> | <kbd>Ctrl + D</kbd> |

## 另一种判断方法

如果我们每写一个输入，就需要判断 `cin.fail()`，这样未免有些麻烦。事实上，C++ 提供了一种更方便的方法：
```CPP
#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        cout << "Input success: " << n << endl;
    } else {
        cout << "Input fail." << endl;
    }
}
```
就像这样，把输入的代码放在 if 语句的条件中。这个时候，程序会读取输入，如果输入成功则执行 if 语句的真分支语句，否则（进入了失败状态）执行 if 语句的假分支语句。比如上例中：
```io
**42↵**
Input success: 42
```
```io
**Hello↵**
Input fail.
```

> 这里发生的其实是从 `cin` （`std::istream` 类型）到布尔类型的转换。若 `cin` 处于失败状态，则转换为 `false`；若 `cin` 正常读取输入，则转换为 `true`。

类似地，`cin` 语句也可以放在 while 语句的条件中。此时，如果输入符合期望的格式则不断执行循环体；如果出现了不符合期望的格式或发生了 EOF 错误，则跳出循环。这个技巧经常在算法竞赛中使用。