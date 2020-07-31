# while 语句

循环语句（Iteration statement）是控制程序重复执行某个动作的语句。循环语句大致可以分为 **while 语句**和 **for 语句**两部分，本节介绍其中最基础的 while 语句。

while 语句可以用于引入循环。它有两种写法，分别称为 **while 循环**和 **do-while 循环**。

## while 循环

while 循环我们在第一章已经见过了。现在来正式地描述它的写法：
```sdsc
while (*条件表达式*)
    *循环语句*
```
执行 while 循环的本质是**不断地**执行 `@*循环语句*@` **直到** `@*条件表达式*@` 的值为 `false` （或者可以隐式转换为 `false`）。其中，判断 `@*条件表达式*@` 的值总是发生在执行 `@*循环语句*@` **之前**。我们称被循环的那条 `@*循环语句*@` 为**循环体**。

比如这是一个典型的 while 循环：
```cpp
while (i < 10)
    cout << i++ << endl;
```
这里循环体是一个输出语句，在输出之后会令 i 递增 1（因为是后缀自增运算符）。如果 `int` 型变量 `i` 的初始值为 `0` ，则整段代码的作用是从小到大输出 0 到 9 这十个数字。整个过程比较简单，这里便不再赘述了。

如果你觉得刚才在输出语句中递增的这种写法很别扭的话，没关系这很正常；你只需要分成两条语句就可以。所以，如果想要在循环体中执行多余一条的语句，需要用复合语句包起来。这便是我们第一章见过的带大括号的那种形式了：

```cpp
int i{0};
while (i < 10) {
    if (i % 2 == 0) {
        cout << i << endl;
    }
    i++;
}
```
请尝试自己描述这段代码的运行效果。实际编译运行一下，看看你想得对不对。

你可能在第一章习题中尝试了如何写一个死循环，即永远执行下去的循环。实现方法很简单，只需让条件表达式恒为 `true` 即可：
```cpp
while (true) {
    cout << "Endless output" << endl;
}
```

还有需要注意的一点是，如果 while 语句的条件最初就不成立（即条件表达式为 `false`），那么循环体一次也不会被执行。这是因为对条件表达式的求值总是发生在执行循环体之前的缘故。比如以下代码：
```cpp
int i{5};
while (i < 5) {
    cout << i << endl;
    i++;
}
```
不会有任何输出。

## do-while 循环

do-while 循环和 while 循环很相似。先来看一下它的写法：

```sdsc
do
    *循环语句*
while (*条件表达式*);
```

相比 while 循环，do-while 循环首先是一个 do，然后循环语句放在了 while 的前面，最后还多了一个分号。那么 do-while 的执行效果是什么呢？本质上仍然是**不断地**执行 `@*循环语句*@` **直到** `@*条件表达式*@` 的值为 `false` （或者可以隐式转换为 `false`）。但是，判断 `@*条件表达式*@` 的值总是发生在执行 `@*循环语句*@` **之后**。同样地，称被循环的那条 `@*循环语句*@` 为**循环体**。

所以说 do-while 循环和 while 循环的区别就在于判断条件的时机不同。因此，do-while 的循环体无论如何都会被执行至少一次：
```cpp
do
    cout << "Hello, world!" << endl;
while (false);
```
即便条件恒假，仍然会输出一次 `Hello, world!`。

第一章结尾的“猜数游戏”可以使用 do-while 循环：
```CPP
#include <iostream>
using namespace std;
int main() {
    int ans{42};
    int x{0};
    do {
        cin >> x;
        if (x > ans) {
            cout << "That's bigger than the answer. Try again?" << endl;
        }
        if (x < ans) {
            cout << "That's smaller than the answer. Try again?" << endl;
        }
    } while (x != ans);
    cout << "Bingo! You got the answer!" << endl;
}
```
相比 while 循环，可以减少一行输入语句。

do-while 另外一个常见的用途是“输出一个整数的每一位”：
```cpp
do {
    cout << x % 10 << endl;
} while (x /= 10);
```
这里运用了[模运算](/ch02/part2/arithmetic_operator.md)来取出整型变量 `x` 的最低位，用[复合赋值运算](/ch02/part2/assignment_operator.md#复合赋值运算符)来“删除” `x` 的最低位。除此之外，还利用了整型到布尔类型的[隐式转换](/ch02/part2/implicit_conversion.md#布尔类型与其它算术类型之间的转换)从而保证循环能够刚好终止。这里不再展开说明这段代码如何工作，感兴趣的读者可以自行研究。

我们用 while 语句的图示来结束本节的内容：

<table id="whileTable">
<tr>
    <td>
    <pre class="table-code sdsc">
<em>开始</em>
while (<em>条件</em>)
    <em>循环体</em>
<em>结束</em>
</pre>
    </td>
    <td>
    <pre class="table-code sdsc">
<em>开始</em>
do
    <em>循环体</em>
while (<em>条件</em>);
<em>结束</em>
</pre>
    </td>
</tr>
<tr>
    <td>
        <div id="while"></div>
    </td>
    <td>
        <div id="do"></div>
    </td>
</tr>
</table>
<script>
flowchart.parse('st=>start: 开始\n\
e=>end: 结束\n\
bd=>operation: 循环体\n\
cond=>condition: 条件\n成立？\n\
\n\
st->cond\n\
cond(yes)->bd\n\
bd->cond\n\
cond(no)->e').drawSVG('while',{
    'yes-text':'是',
    'no-text':'否'
});
flowchart.parse('st=>start: 开始\n\
e=>end: 结束\n\
bd=>operation: 循环体\n\
cond=>condition: 条件\n成立？\n\
\n\
st->bd\n\
cond(yes)->bd\n\
bd->cond\n\
cond(no)->e').drawSVG('do',{
    'yes-text':'是',
    'no-text':'否'
});
</script>
