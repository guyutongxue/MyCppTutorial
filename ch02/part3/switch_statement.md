# switch 语句

请考虑这样一个现实问题：输入一个不大于 5 的正整数，输出它的英文单词。那么运用 if 语句，你可以写出：
```cpp
int a;
cin >> a;
if (a == 1) {
    cout << "one" << endl;
} else if (a == 2) {
    cout << "two" << endl;
} else if (a == 3) {
    cout << "three" << endl;
} else if (a == 4) {
    cout << "four" << endl;
} else if (a == 5) {
    cout << "five" << endl;
} else {
    cout << "wrong" << endl;
}
```
你会发现这样写有一点繁琐。switch 语句可以一定程度上简化这种逻辑的写法。来看看 switch 语句如何实现：
```cpp
int a;
cin >> a;
switch (a) {
    case 1: cout << "one" << endl; break;
    case 2: cout << "two" << endl; break;
    case 3: cout << "three" << endl; break;
    case 4: cout << "four" << endl; break;
    case 5: cout << "five" << endl; break;
    default: cout << "wrong" << endl; break;
}
```
这段代码可以很好地完成任务，你可以自己试一下。现在来仔细观察一下这段代码，其中 switch 语句的典型结构*大致*是这样的：
```sdsc
switch (*表达式*) {
    case *常量1*: *语句...*
    case *常量2*: *语句...*
    *...*: *...*
    default: *语句...*
}
```
switch 语句的执行过程是这样的：计算 `@*表达式*@` 的值，然后依次检查逐个 `case` 后面的常量：若 `@*表达式*@` 的值和 `@*常量1*@` 相等，则开始执行 `@*常量1*@` 后面的语句；否则，若 `@*表达式*@` 的值和 `@*常量2*@` 相等，则开始执行 `@*常量2*@` 后面的语句。这样一直做下去，如果 `@*表达式*@` 的值和上述任意一个常量都不相等，则开始执行 `default:` 后面的语句。

其中，`@case *常量*:@` 和 `default:` 被称为**语句标号（Statement label）**，它决定了程序执行 switch 语句的**入口**。也就是说，语句标号决定了程序从哪里开始执行语句，但没有决定到哪里结束执行语句。

为什么这样说？你会发现上面程序有一些东西我还没有讲：每一行最后的 `break;` 是什么？`break` 是 C++ 的一个关键字，它再加上一个分号就组成了 break 语句。为了体现 break 语句的作用，你可以先把它们都删掉：
```cpp
int a;
cin >> a;
switch (a) {
    case 1: cout << "one" << endl;
    case 2: cout << "two" << endl;
    case 3: cout << "three" << endl;
    case 4: cout << "four" << endl;
    case 5: cout << "five" << endl;
    default: cout << "wrong" << endl; 
}
```
然后你可以尝试编译运行：
```io
**3↵**
three
four
five
wrong
```
你会发现运行的结果不一样了：当输入 `3` 的时候，它把第六行到第九行的所有语句都执行了。这是因为，语句标号只规定了 switch 执行的入口，而没有指定出口。当 `a` 为 `3` 的时候，程序会检查每一个 `case` 标号的常量是否与 `a` 相等，在第六行的 `case 3:` 这个标号处成立，于是开始执行它后面的所有语句：第六行输出 `three` 、第七行输出 `four` 、第八行输出 `five` ，最后一行输出 `wrong` 。由于没有规定出口，因此程序会一直执行到 switch 语句的大括号结束。

那么这个时候就轮到 break 语句出场了。**在 switch 语句中，执行 break 语句会退出 switch 语句的执行。**因此，在每个标号的“最后”加上 break 语句，就可以实现程序入口和出口的统一。比如在最初的那段代码中，当 `a` 为 `3` 的时候，程序在第六行进入，执行输出语句，随后执行 break 语句，便退出了 switch。这就是我们想要的结果了。

在某些时候，入口和出口不必统一。比如写一个程序判断输入的字母是否为“元音字母”，那么可以直接：
```cpp
char c;
cin >> c;
switch (c) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u': cout << "Yes" << endl; break;
    default: cout << "No" << endl; break;
}
```
这里，前四个标号没有“对应的” break 语句，那么进入这四个标号就会直接执行第五个标号 `case 'u'` 下面的输出语句；因此对于这五个标号都可以输出 `Yes` 并退出。若不是元音字母，则落入 `default` 标号，此时输出 `No` 并退出。（`default` 标号的 break 语句是可选的。）

> switch 语句中，控制穿过其它 case 标号的行为（即不写 break 语句）称为直落（Fall through）。编译器可能对直落发出警告。你可以用 `[[fallthrough]]` 属性来避免这一警告。

## 注意事项

switch 语句中的 `@*表达式*@` 必须是整数类型或者可以隐式转换为整数类型；case 语句标号中的常量必须可以隐式转换为与 `@*表达式*@` 相同的类型。

尽量避免在 switch 语句中使用声明语句。若使用，你需要用复合语句的形式将其括起，原因会在稍后的章节中讲解。

> 正如字面意思，语句标号实际是语句的一个部分；也就是说任何一个标号必须依赖于一个语句。因此标号后面至少要有一个语句。这样的用法：`switch (1) { default: }` 是错误的，因为 `default` 标号后面没有语句。这里你可以使用空语句。
> 
> 但一个语句可以拥有多个标号，比如判断元音的例子中输出语句拥有五个标号。
> 
> switch 语句的主体部分是一个复合语句，但也可以是任意的其它语句，尽管这样没有任何意义。