# for 语句

```cpp codemo(input=1 4 2 8 5 7 3 6 9 0)
#include<iostream>
using namespace std;
int main() {
    int a[10]{};
    int i;
    // 输入数组
    i = 0;
    while (i < 10) {
        cin >> a[i];
        i++;
    }
    // 输出数组
    i = 0;
    while (i < 10) {
        cout << a[i] << endl;
        i++;
    }
}
```

在之前的学习中，我们会发现循环经常被用作计数，比如对一个数组输入输出。这种循环的特点是，在循环开始前需要设置一个循环变量，而且要对这个变量做一次赋值（比如 `i = 0`）；同时，每一次循环体执行最后都需要让这个循环变量的值“步进”一次。基于这个共同点，C++ 引入了 for 语句。

```cpp codemo(input)
#include<iostream>
using namespace std;
int main() {
    int a[10]{};
    int i;
    // 输入数组
    for (i = 0; i < 10; i++) {
        cin >> a[i];
    }
    // 输出数组
    for (i = 0; i < 10; i++) {
        cout << a[i] << endl;
    }
}
```
点一下右侧按钮，看看 for 语句如何写刚才那个程序。可以发现，for 语句类似 while 循环，只是原先写条件表达式的地方分成了三块——你也许已经猜到了这三块的含义。下面我们正式地介绍 for 语句的写法：

```sdsc
"for ("初始语句 [条件表达式]";" [迭代表达式]")"
    循环语句
```

这样一看，for 语句的括号内部分成了 `@初始语句@` `@条件表达式@` `@迭代表达式@` 三个部分。现在解释 for 语句如何执行：

1. 首先执行 `@初始语句@` 。 `@初始语句@` 是**一条表达式语句或者一条简单的声明语句**，因此它一定是分号结尾的。
2. 然后判断 `@条件表达式@` 是否为 `true`。若是，则进入循环执行 `@循环语句@` ；否则退出循环。 `@条件表达式@` 是可选的，若不写则默认为 `true`。
3. 在 `@循环语句@` 执行完毕后，如果存在 `@迭代表达式@` ，则计算 `@迭代表达式@` 所指定的运算。 `@迭代表达式@` 运算完成后，返回步骤 2 继续循环。

文字描述看上去非常抽象，因此这张图有助于你理解这个过程：

```flow
st=>start: 开始
e=>end: 结束
bd=>operation: 循环体
init=>operation: 初始语句
cond=>condition: 条件
表达式
iter=>operation: 运算
迭代表达式

st(right)->init
init(right)->cond
cond(yes,right)->bd
bd(right)->iter
iter(top)->cond
cond(no)->e
```

实际上，上述 for 语句完全等价于下面这段代码：
```sdsc-legacy
{
    *初始语句*
    while (*条件表达式*) {
        *循环语句*
        **迭代表达式**;
    }
}
```

举个简单的例子，下面这段代码可以输出 0 到 20 之间 3 的倍数：
```cpp codemo(show)
#include<iostream>
using namespace std;
int main() {
    int i;
    for (i = 0; i < 20; i += 3) {
        cout << i << endl;
    }
}
```
通过调整初始语句、条件表达式和迭代表达式，你还可以让它倒着输出：
```cpp codemo(show)
#include<iostream>
using namespace std;
int main() {
    int i;
    for (i = 18; i >= 0; i -= 3) {
        cout << i << endl;
    }
}
```

以上就是 for 语句的全部讲解了。for 语句在各种语言的编程中都非常常见，希望读者能够充分理解并运用。

> for 语句中 for 一词来源于“令 i 从 1 循环到 n，做……”的英文 "For i from 1 to n, do..."。在早期的语言中，for 循环写作 `for i = 1 to n do statement`，在 C++ 中则使用表达式和语句来替换 `to` 和 `do` 这些关键词。

> for 语句和 while 语句在条件表达式的位置也可以放单个变量、带初始化器的声明（没有分号）。此时循环的条件取决于这个被声明并定义的变量隐式转换到布尔类型的值。

> for 语句还有另一种形式称为“范围 for”。它在某些场合下可以减少代码量，但需要更多的前置知识。我会在[第八章](/ch08/stl_containers/iterator_usage.md#遍历)讲它。
