# 输入

## 字符串输入

想要输入一个字符串到字符数组，一般有三种方法：

### 1. `cin >>`

最常见的就是我们上一节中见到的，直接 `cin >>`：
```cpp
char a[30]{};
cin >> a;
```
但是这样存在一些问题。
- 一是遇到空格（或 Tab、换行）**自动结束**：输入 `How are you?` 的结果只能让 `a` 存下 `"How"`；
- 二是可能发生越界，如果输入**超过字符数组大小的字符串会发生意外错误**（即越界访问数组 `a`）。

因此我们尽量只在有限的场合下使用它。

### 2. `cin.getline()`

第二种用法是 `cin.getline()`。你可以把 `cin.getline` 当成一个函数。这个函数可以接收两个参数：*字符数组* 和 *最大长度*。如：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    cin.getline(a, 30);
    cout << a << endl;
}
```
此时，你可以自由地输入任何大小不超过 30 的字符串。`cin.getline()` 将一直读到换行符才会停止：
```io
**Reading input!↵**
Reading input!
```

当输入的字符个数超过 *最大长度* 时会发生截断。比如上例中 `cin.getline()` 限制为 30 个，那么读取的时候只会将前 29 个字符和 `'\0'` 存入数组 `a`，剩下的字符仍然停留在缓冲区中而不被读取。同时，会导致 `cin` 进入失败状态。关于失败状态的详细讨论将会在后面的章节中展开。

```io
**abcdefghijabcdefghijabcdefghijabcdefghij↵**
abcdefghijabcdefghijabcdefghi
```

（相比 `cin >>`，使用 `cin.getline()` 不会导致数组越界这种危险的事情发生。）

默认情况下，`cin.getline()` 遇到换行符才会终止。如果你愿意的话，你可以设置为别的字符，只需给它多提供一个参数就可以。比如我想让它读到字符 `'r'` 停止，那么就：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    cin.getline(a, 30, 'r'); // 最后再添加一个参数
    cout << a << endl;
}
```
运行结果如：
```io
**Hello, world!↵**
Hello, wo
```

注意，当 `cin.getline()` 读到终止字符的时候，会将其从缓冲区中**拿走并抛弃**，然后再向字符数组中存储一个空字符以示结束。

### 3. `cin.get()`

`cin.get()` 也可以当做一个函数，它的用法和 `cin.getline()` 几乎完全一致。比如：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    char b[30]{};
    cin.get(a, 10);      // 设置最大长度为 10，默认终止字符为换行 '\n'
    cin.get(b, 30, 'r'); // 设置终止字符为 'r'
    cout << a << endl;
    cout << b << endl;
}
```
```io
**Hi, C++!↵**
**How are you?↵**
Hi, C++!<br>
How a
```
是的，非常相似——不过为什么输出多了一个换行？这就是 `cin.get()` 和 `cin.getline()` 唯一不同的地方了：`cin.get()` 遇到终止字符后，**并不会从缓冲区中拿走它**。因此，在输入完第一行后，缓冲区内是这些字符：
```
缓冲区：{'H', 'i', ',', ' ', 'C', '+', '+', '!', '\n'}
```
由于 `'\n'` 是终止字符，所以读取到 `'\n'` 就会停止。但是 `'\n'` 仍然残留在缓冲区中……
```
数组 a：{'H', 'i', ',', ' ', 'C', '+', '+', '!', '\0', ... }
缓冲区：{'\n'}
```
所以执行 `cin.get(b, 30, 'r')` 的时候，首先会把这个 `'\n'` 读取出来，直到遇到 `'r'` 才会停止：
```
数组 b：{'\n', 'H', 'o', 'w', ' ', 'a', '\0', ...}
缓冲区：{'r', 'e', ' ', 'y', 'o', 'u', '?', '\n'}
```
同样地，`'r'` 及后面的字符全部滞留在了缓冲区中。之后在输出 `b` 的时候，会输出最开始的换行符，所以多了一个换行。

## 字符输入

下面我们来学习如何输入一个字符类型的变量。（当然了，这里就是指 `char` 类型。）

### 1. `cin >>`

`cin >>` 是最简单的输入到 `char` 的方法。我们在第一、二章中就已经很频繁地使用了。
```cpp
char a;
cin >> a;
```
但是问题仍然存在，就是 `cin >>` 会忽略空格、Tab 和换行符（它们称为空白字符）。因此想把空格输入到一个 `char` 型变量是不能这样做的：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a, b, c;
    cin >> a >> b >> c;
    cout << a << endl;
    cout << b << endl;
    cout << c << endl;
}
```
输入的空格会被跳过：
```io
**@ #$↵**
@
#
$
```
这个时候就需要换一种方法了。

### 2. `cin.get()`

你可以用 `cin.get()` 来替换 `cin >>`，从而允许输入空格、Tab 和换行到 `char` 型变量中。它的用法是这样的：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a, b, c;
    cin.get(a);  // 输入到 a
    cin.get(b);  // 输入到 b
    cin.get(c);  // 输入到 c
    cout << a << endl;
    cout << b << endl;
    cout << c << endl;
}
```
这个时候空格就可以存入变量中：
```io
**@ #$↵**
@<br>&nbsp;
#
```

除此之外，`cin.get()` 还有另一种形式，它的效果是完全相同的：
```CPP
#include <iostream>
using namespace std;
int main() {
    char a, b, c;
    a = cin.get();  // 输入到 a
    b = cin.get();  // 输入到 b
    b = cin.get();  // 输入到 c
    cout << a << endl;
    cout << b << endl;
    cout << c << endl;
}
```
这种形式的输入在某些场合特别有用。

## 输入其它

我们也知道 `cin >>` 还可用于输入整数、浮点数等。这里面并没有太多新知识，唯需了解**空白字符是这类输入的终止字符**，即当 `cin >>` 读取数时遇到空格、Tab和换行就会终止此次读取。同样地，`cin >>` 读取数时遇到空白字符也会忽略，所以
```io
**42&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;56↵**
```
和
```io
**42↵**
**↵**
**↵**
**↵**
**↵**
**&nbsp;&nbsp;56↵**
```
的效果是一致的：这些空白字符都会被忽略。

## 注意事项

`cin.get()` 在输入字符串的时候会残留终止字符，这件事情上文已经细致地说明了。因此这样的代码
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    char b[30]{};
    cin.get(a, 30, '!');
    cin.get(b, 30, '!');
    cout << "a is: " << a << endl;
    cout << "b is: " << b << endl;
}
```
它会让 `b` “空手而归”：
```io
**First string!Second string!↵**
a is: First string
b is: 
```
因为第 6 行输入完成之后残留 `'!'` 在缓冲区中，当第 7 行再次 `cin.get()` 时，一上来就是终止字符，所以会直接向 `b` 中输入表示结束的空字符并停止读入。接下来再多的 `cin.get()`，只要它读取字符串的终止字符还是 `'!'`，它仍然无济于事，啥也读不到。

这个时候，你可以通过读入字符的 `cin.get()` 打破这一僵局。
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    char b[30]{};
    cin.get(a, 30, '!');
    char temp;           // 把残留的 '!' 读取到临时字符变量 temp 中
    cin.get(temp);       // 当然你可以直接用一句 `cin.get();`，无需声明额外变量
    cin.get(b, 30, '!');
    cout << "a is: " << a << endl;
    cout << "b is: " << b << endl;
}
```
这样就能解决问题：
```io
**First string!Second string!↵**
a is: First string
b is: Second string
```

对于 `cin >>`，也有同样的问题。比如
```CPP
#include <iostream>
using namespace std;
int main() {
    char a[30]{};
    cin >> a; // 这里仅用字符串演示；然而cin>>读取字符和数的时候也会发生类似的情形
    char b;
    cin.get(b);
    cout << "a is: " << a << endl;
    cout << "b is: " << b << endl;
}
```
的结果是：
```io
**Hello @↵**
a is: Hello
b is: &nbsp;
```
`b` 并没有读入 `'@'`，而是读入了之前那个空格，因为 `cin >>` 也不会处理残留的空格、Tab 和换行符，所以这个时候你可能需要再加入一个临时的 `cin.get()` 来消除影响。

> 在处理残留字符时，也可以用 `cin.ignore()` 来代替 `cin.get()`。它的作用是抛弃缓冲区的下一个字符，和 `cin.get()` 的区别是返回值不同。