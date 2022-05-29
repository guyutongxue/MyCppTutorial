# 综合运用

## 猜数游戏

咱们来写一个猜数的游戏。程序给定一个 1 到 100 之间的整数让用户来猜。用户输入大了或者小了程序都会提示——猜错的话还可以继续猜，直到猜对为止。比如程序设定的整数是 42。那么整个输入输出可能是以下这样的：

```io
¶50↵
That's bigger than the answer. Try again?
¶25↵
That's smaller than the answer. Try again?
¶37↵
That's smaller than the answer. Try again?
¶43↵
That's bigger than the answer. Try again?
¶42↵
Bingo! You got the answer!
```

看上去还挺有意思的。那么这个程序该怎么写呢？

```cpp codemo(input=50\n25\n37\n43\n42)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    // ... 然后呢？
}
```
不管怎么说，先把（咱到现在都不知道啥意思的）开头结尾写上；然后设定整数变量 `ans` 为答案。


```cpp codemo(clear, input)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    cin >> x;
    // ... 然后呢？
}
```
这个时候需要读取一个输入。所以需要用一个变量 `x` 来存储这个输入的整数。

```cpp codemo(clear, input)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    cin >> x;
    if (x > ans) {
        // 这里放猜大了应该做的事
    }
    if (x < ans) {
        // 这里放猜小了应该做的事
    }
    // ... 然后呢？
}
```
需要判断 x 是大了还是小了，因此需要写一些分支……这里的代码多了起来，请稍微回想一下我们在分支一节学的内容，应该不难理解。

```cpp codemo(clear, input)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    cin >> x;
    if (x > ans) {
        cout << "That's bigger than the answer. Try again?" << endl;
    }
    if (x < ans) {
        cout << "That's smaller than the answer. Try again?" << endl;
    }
    // ... 然后呢？
}
```
注意到每次判断的时候，需要输出一个提示信息，于是我们这样写。

```cpp codemo(clear, input)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    cin >> x;
    while (x != ans) {
        if (x > ans) {
            cout << "That's bigger than the answer. Try again?" << endl;
        }
        if (x < ans) {
            cout << "That's smaller than the answer. Try again?" << endl;
        }
        cin >> x;
    }
}
```
接下来问题来了。如果仅仅如此的话，那么输入一次就结束了，没法让用户多次尝试，不符合我们的预期。那么该如何做呢？聪明的你一定想到了：使用循环。那么在使用前仔细考虑一下循环的条件——没错，当输入的数和答案不相等的时候才会重复执行。另外，每次重复执行前需要再次请求用户输入。因此我们加上这样一个循环。解释一下：当第 6 行输入 `x` 结束之后，检查 `x` 是否是正确答案。如果不是正确答案，那么就需要进入循环，根据不同大小输出错误提示；随后允许用户继续尝试不同 `x` 的输入。（也就是第 14 行的那个输入。）这个输入结束后，回过头来继续检查 `x` 是否正确，周而复始下去。

```cpp codemo(input)
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    cin >> x;
    while (x != ans) {
        if (x > ans) {
            cout << "That's bigger than the answer. Try again?" << endl;
        }
        if (x < ans) {
            cout << "That's smaller than the answer. Try again?" << endl;
        }
        cin >> x;
    }
    cout << "Bingo! You got the answer!" << endl;
}
```
几乎完成了，就差最后一点：加上得到正确答案的提示就 OK 了。注意到当用户输入正确答案的时候会退出循环，于是在循环结束的地方加上这个输出提示就好。

真棒！你现在也学会了如何去嵌套循环和分支。当然这里只演示了分支在循环的内部的情形，实际上它们之间可以随意地互相嵌套。本节的练习会提供更多例子供你学习参考。

## 注释和缩进

随着我们代码量的增加，有时候理解代码会出现一定的困难。这个时候就需要**注释**（Comment）派上用场了。注释就是对代码的解释和说明，其目的是让人们能够更加轻松地了解代码。在 C++ 中，注释是这样写的：
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    int a{42}; // 两条斜杠后面的就是注释。这里声明并定义了一个变量。
    cout << a << endl; // 将变量 a 的值输出。
}
```
只要出现了两个斜杠 `//`  的地方，从此往后一直到本行结尾的地方都是注释了。注释可以随便写，写什么都行；但一般是对本行或者下一行代码的内容说明。为什么注释能随便写？因为编译器在编译程序时会忽视注释的部分，因此一般注释怎样写都不会对编译的结果产生影响。

你会发现这种注释只能写一行。因而还有一种注释方式叫多行注释：
```cpp codemo
#include <iostream>
using namespace std;
int main() {
    /* 斜杠 + 星号 后面的就是多行注释。
       这一行也是注释。注释一直将持续到表示注释结尾的符号前。
       星号 + 斜杠就是表示注释结尾的符号。看下面那行：
    */
    int a{42};
    cout << a << endl; /* 当然也可以写成一行的模样。 */
}
```
多行注释以 `/*` 开头，以 `*/` 结尾。其中的任意字符都会成为注释。需要注意的是：多行注释不能嵌套。

注释可以很好地提升代码可读性。那么除此之外还有什么提高可读性的办法吗？那就是恰当使用缩进。你一定注意到了，示例代码中如果左大括号 `{` 和右大括号 `}` 之间出现了整整一行，那么这一行就会向右挪了一点——
```cpp
#include <iostream>
int main() {
    int a{0}; /* 注意这一行相比上一行向右挪了 4 个字符：
^^^^
就这个 */
    while (a <= 10) {
        a = a + 1; /* 这一行又挪了 4 个字符：
 ->|----|<-
    缩进   */
    }
}
```
缩进就是指某一行文本相对上一行文本发生了水平的位移。在编程领域，缩进一般是向右平移 4 个字符的宽度。我们代码中采用了加上 4 个空格的方法——实际并不用按那么多次键盘，主流的编辑器只需按一下键盘上的 <kbd>Tab</kbd> 键（位于 <kbd>Q</kbd> 键的左侧）就可以自动加上 4 个空格（另外，按下 <kbd>Shift + Tab</kbd> 就可以快速删除 4 个空格）。当然有些较老的编辑器可能是插入 8 个空格或者插入了一个叫“制表符”的东西，这个时候就需要稍微调整一下编辑器设置了。

其实缩进是没有必要的——C++ 程序对空格是不敏感的，也就是说写成这样稀奇古怪的形状：
```cpp codemo(show)
#include <iostream>
int main() {
int a{0};
while (a <=             10) {
a = a        +           1;
}
}
```
也是完全没问题的，但是没有缩进看上去非常不舒服。因为，缩进可以有效分清程序的层级关系（比如看清楚左右大括号的对应关系），也有助于理清思路；因此希望读者们养成经常写注释、正确留缩进的好习惯。总结来说，就是：代码是给计算机看的，而注释和缩进是给我们人类看的。

## 练习

1. 平面直角坐标系上有一个长方形，它的四个顶点分别位于 (0,0)，(4,0)，(4,4)，(0,4)。请编写一个程序输出所有长方形内部和边界上的整数点（横纵坐标都为整数的点）。你可以按照任意你喜欢的顺序输出。
1. BMI 是衡量人是否健康的一个指标。如果规定 BMI 介于 19 （含）至 24 （含）之间的人是健康的，那么请编写一个程序，输入一个整数作为张三的 BMI ，判断张三是否健康。（如果你愿意的话，你也可以输出他不健康的时候是胖了还是瘦了。）
1. 编写一个求和的程序。
   1. 输入：首先输入一个整数 n。如果 n 是正数的话，则继续输入 n 个整数。
   1. 输出：输出这 n 个整数的和。如果 n 不是正数，则输出一条错误提示。

## 练习参考答案

```cpp codemo(show)
#include <iostream>
using namespace std;
int main() {
    int i{0};    // 横坐标
    int j{0};    // 纵坐标
    while (i <= 4) {   // 遍历每一“列”
        j = 0;   // 定位到每一“列”的第一个位置
        while (j <= 4) {   // 遍历每一“行”
            cout << "(" << i << ", " << j << ")" << endl;
            j = j + 1; // 挪到这一列的下一位置
        }
        i = i + 1; // 挪到下一列
    }
}
```
```cpp codemo(show)
#include <iostream>
using namespace std;
int main() {
    int bmi{0};
    cin >> bmi;
    if (bmi >= 19) {
        if (bmi <= 24) {   // 当 bmi 大于等于 19 的同时还小于等于 24
            cout << "Healthy." << endl;
        } else {           // 当 bmi 大于 24 时
            cout << "Unhealthy: fat." << endl;
        }
    } else {               // 当 bmi 小于 19 时
        cout << "Unhealthy: thin." << endl;
    }
}
```
```cpp codemo(show)
#include <iostream>
using namespace std;
int main() {
    int n{0};   // 个数 n
    int i{1};   // 用于计数
    int sum{0}; // 保存当前计算的和
    int x{0};   // 用于输入
    cin >> n;   // 输入个数 n
    if (n > 0) {
        while (i <= n) { // 输入 n 个数，i 是当前输入第几个的意思
            cin >> x;
            sum = sum + x;  // 输入并加到 sum 里去
            i = i + 1;   // 输入下一个
        }
        cout << sum << endl;
    } else {   // 当 n 非正时输出提示
        cout << "Invalid n!" << endl;
    }
}
```

