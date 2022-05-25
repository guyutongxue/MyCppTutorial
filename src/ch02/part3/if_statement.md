# if 语句

**分支语句**（Branch statement），又称选择语句（Selection statement）、条件语句（Conditional statement），是引入分支结构的语句。在 C++ 中有两种分支语句：**if 语句**和 **switch 语句**。接下来我们首先学习 if 语句。

我们之前已经在第一章已经了解过 if 语句了。不过这里要更正式地描述它的写法：

```sdsc-legacy
if (*条件表达式*)
    *真分支语句*
<div class="opt-block">else
    *假分支语句*
</div>
```

用文字描述的话，就是 `if` 关键字后面先写上括号括起的 `@*条件表达式*@` ，随后应该写上**一句** `@*真分支语句*@`。此外，还可以**可选地**写出 `else` 分支，同样也是**一句** `@*假分支语句*@`。

执行 `if` 语句的整体作用为：若 `@*条件表达式*@` 的值为 `true` 或者可以隐式转换为 `true` ，则执行 `@*真分支语句*@`；若存在 `else` 分支，则当 `@*条件表达式*@`  的值为 `false` 或者可以隐式转换为 `false` 的时候执行 `@*假分支语句*@`。

因此下面给出了一个典型的 if 语句：
```cpp
if (a > b)
    max = a;
else
    max = b;
```
这个 if 语句的意思已经很清楚了：令变量 `max` 的值为 `a` 和 `b` 中较大的那个。我相信不用太过具体的解释也能理解它的原理。

请注意，`if` 要求它的分支语句都只能是一条。那么问题来了：如果想要在条件为 `true` 的时候执行多条语句，该如何做呢？这个时候复合语句就派上用场了。因此可以再分支的地方写成复合语句的样子：
```cpp
if (a > b)
    { max = a; cout << "a is bigger" << endl; }
else
    max = b;
```
请注意这里第二行就使用了复合语句来作为真分支语句。这个复合语句由两条子语句构成：第一个是赋值语句，第二个是输出语句。这就是说，在条件为 `true` 的时候会依次执行赋值、输出这两个动作。因为 C++ 中换行和空格都是无所谓的，所以可以写成我们在第一章见过的模样：
```cpp
if (a > b) {
    max = a;
    cout << "a is bigger" << endl;
} else
    max = b;
```

另外，由于 if 语句本身也是一条语句，因此可以把另一个 if 语句放在分支语句的位置上。比如：
```cpp
if (a > b)
    cout << "a is bigger" << endl;
else
    if (a == b)
        cout << "a equals to b" << endl;
    else
        cout << "a is smaller" << endl;
```
这里，外层的 if 语句的假分支语句是另外一条 if 语句。这就是 if 语句的一种嵌套。由于 C++ 中换行和空格都是无所谓的，所以经常写成这样的形式：
```cpp
if (a > b)
    cout << "a is bigger" << endl;
else if (a == b)
    cout << "a equals to b" << endl;
else
    cout << "a is smaller" << endl;
```
看上去就会舒服很多。

## 注意事项

由于 if 的分支只能是一条语句的原因，有时候人们会被不正确的缩进所误导：
```cpp
if (a > b)
    max = a;
    cout << "a is bigger" << endl;  // 这条语句不属于 if 的分支。它无论如何都会被执行
```
因此我们建议在 if 语句的分支处尽可能地使用复合语句：
```cpp
if (a > b) {
    max = a;
}
cout << "Hello" << endl;


if (a > b) {
    cout << "a is bigger" << endl;
} else if (a == b) {
    cout << "a equals to b" << endl;
} else {
    cout << "a is smaller" << endl;
}
```

我们用 if 语句的图示来结束本节的内容：
<table style="float: left"><tr><td>
    <pre><em>开始</em>
if (<em>条件</em>)
    <em>真分支语句</em>
<em>结束</em></pre>
</td></tr></table>

```flow
st=>start: 开始
e=>end: 结束
true=>operation: 真分支语句
cond=>condition: 条件成立？

st->cond
cond(yes)->true
true->e
cond(no)->e
```

<table style="float: left"><tr><td>
    <pre>
<em>开始</em>
if (<em>条件</em>)
    <em>真分支语句</em>
else
    <em>假分支语句</em>
<em>结束</em></pre>
</td></tr></table>


```flow
st=>start: 开始
e=>end: 结束
true=>operation: 真分支语句
false=>operation: 假分支语句
cond=>condition: 条件成立？

st->cond
cond(yes)->true
true->e
cond(no)->false
false->e
```
