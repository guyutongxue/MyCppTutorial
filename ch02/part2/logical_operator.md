# 逻辑运算符

逻辑运算符其实对应了逻辑电路里的与门、或门和非门，也可以对应数学命题上的且（$\wedge$）、或（$\wedge$）和非（$\wedge$）。所以逻辑运算符一共有下面三个：

| **运算符** | **名称** | **作用** |
| --- | --- | --- |
| `a && b`  | 逻辑与运算符 | 两布尔类型是否**都为** `true`  |
| <code>a &#124;&#124; b</code>  | 逻辑或运算符 | 两布尔类型是否**存在** `true`  |
| `!a`  | 非运算符 | 求反 |

逻辑表达式的写法如下：
```
左侧操作数 && 右侧操作数
左侧操作数 || 右侧操作数
!操作数
```

这里的操作数期望为布尔类型。若非布尔类型，则进行隐式转换：非零值转换为 `true` ，零值转换为 `false` 。

逻辑运算结果可以参考以下表格，它和数学上的意义保持一致（如果你对数学上且、或和非的概念不清楚，可参考*人教版高中数学（B版）的选修 1-1 第一章*；或者咨询你的数学老师）：
<table style="display:inline-block">
    <tr>
        <td colspan="2" rowspan="2"><code>a && b</code></td>
        <td colspan="2"><code>a</code></td>
    </tr>
    <tr>
        <td><code>true</code></td>
        <td><code>false</code></td>
    </tr>
    <tr>
        <td rowspan="2"><code>b</code></td>
        <td><code>true</code></td>
        <td><code>true</code></td>
        <td><code>false</code></td>
    </tr>
    <tr>
        <td><code>false</code></td>
        <td><code>false</code></td>
        <td><code>false</code></td>
    </tr>
</table>
&nbsp;&nbsp;
<table style="display:inline-block">
    <tr>
        <td colspan="2" rowspan="2"><code>a || b</code></td>
        <td colspan="2"><code>a</code></td>
    </tr>
    <tr>
        <td><code>true</code></td>
        <td><code>false</code></td>
    </tr>
    <tr>
        <td rowspan="2"><code>b</code></td>
        <td><code>true</code></td>
        <td><code>true</code></td>
        <td><code>true</code></td>
    </tr>
    <tr>
        <td><code>false</code></td>
        <td><code>true</code></td>
        <td><code>false</code></td>
    </tr>
</table>
&nbsp;&nbsp;
<table style="display:inline-block">
    <tr>
        <td rowspan="2"></td>
        <td colspan="2"><code>a</code></td>
    </tr>
    <tr>
        <td><code>true</code></td>
        <td><code>false</code></td>
    </tr>
    <tr>
        <td><code>!a</code></td>
        <td><code>false</code></td>
        <td><code>true</code></td>
    </tr>
</table>
 
## 优先级和结合方向

三种逻辑运算符的优先级都不同：非运算符的优先级最高，与前缀自增/减运算符同级。逻辑与运算符其次，次于等于/不等于运算符。逻辑或运算符优先级相对最低。

它们的结合方向是：

- 非运算符的结合方向为从右向左，即 `!!!a` 等价于 `!(!(!a))` 。
- 逻辑与和逻辑或运算符的结合方向为从左向右，即 `a || b || c` 等价于 `(a || b) || c` 。

因此对于下面这个复杂的表达式
```cpp
a && !b || c && d && e
```
它等价于 `(a && (!b)) || ((c && d) && e)` 。
 
## 注意事项

当计算机求值逻辑表达式时，并不总是执行全部的运算。举例来说：对于逻辑表达式：
```cpp
a && (b = 0)
```
若 `a` 求值结果为 `false` ，则显然整个表达式的值必然为 `false` ，故计算机**不计算** `b = 0` 表达式的值。因此 `b = 0` 赋值表达式不会被执行， `b` **未被赋值**。

即对于逻辑与运算符来说，若左侧操作数求值结果为 `false` ，则不求值右侧操作数。同理，对于逻辑或运算符来说，若左侧操作数求值结果为 `true` ，则不求值右侧操作数。此特性被称作逻辑运算符的**短路求值（Short-circuiting）**特性。

例如：
```cpp
#include <iostream>
using namespace std;
int main() {
    int a{42}, b{42}, c{42};
    bool result;
    result = ++a || ++b || ++c;
    cout.setf(ios_base::boolalpha);
    cout << result << endl;
    cout << a << " " << b << " " << c << endl;
}
```
这段程序编译运行的结果为：

<pre class="io">
true
43 42 42
</pre>

下面来解释以下。当执行 `result` 的赋值表达式时，先计算 `(++a || ++b)` 的值。由于 `++a` 将 `a` 自增后返回 `43` ，这个非布尔类型遇到逻辑或运算符将隐式转换为 `true` ，故触发逻辑或运算符的短路特性，不求值 `++b` 。同理，整个表达式的值为 `true` 时，触发第二个逻辑或运算符的短路特性，不求值 `++c` 。因此只有 `a` 的值被更改为 `43` ，而 `b` 和 `c` 保持 `42` 不变。

## 练习 

1. 使用表达式判别某一年 `year` 是否为闰年。闰年的条件是符合下面二者之一：
   - 能被4整除，但不能被100整除。
   - 能被100整除，又能被400整除。

## 练习参考答案

法1： `(year % 4 == 0 && year % 100 != 0) || year % 400 == 0` 
法2： `!((year % 4 != 0) || (year % 100 == 0 && year % 400 != 0))` 
 
