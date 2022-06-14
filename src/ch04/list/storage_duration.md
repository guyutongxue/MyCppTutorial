# 存储期

在学习如何建立一个链表之前，我们首先要学习一个叫做**存储期**（Storage duration）的概念。每个变量都拥有一个存储期，指出在什么时候为这个变量分配内存，在什么时候将这个变量的内存释放。

## 自动存储期

在复合语句和形参中声明的局部变量拥有自动存储期（Automatic storage duration）。自动存储期的变量在**进入复合语句**（或函数体）时分配到内存，在**离开复合语句**（或函数体）时释放内存。这个过程我们在[函数章节](/ch03/function_execution.md#参数传递)已经有所演示了。

## 静态存储期

全局变量拥有静态存储期（Static storage duration）。不同于自动存储期，它们会在**程序启动**的时候**立即**分配内存。全局变量会在分配内存后进行初始化。它们**直到程序退出**的时候才和程序共同将存储空间释放给操作系统。全局变量若有初始化器，则它的初始化值必须是编译期常量；如果没有初始化器，则[零初始化](/ch04/array/array_init#idx_零初始化)。

### 静态局部变量（选读）

局部变量也可以拥有静态存储期。你只需要用 `static` 关键字修饰局部变量的声明语句即可。
```cpp codemo
#include <iostream>
using namespace std;
void f() {
    static int a{42};
    a++;
    cout << a << " ";
}
```


和全局变量类似，它们在程序启动的时候获得内存，但不进行初始化。在第一次执行声明语句时，进行初始化；此后再次执行声明语句时什么也不做，不会再次初始化。

```cpp codemo
#include <iostream>
using namespace std;
void f() {
    static int a{42};
    a++;
    cout << a << " ";
}
int main() {
    f();
    f();
    f();
}
```
比如这里 main 函数调用了三次 `f`，但因为初始化只执行一次，所以输出为 `43 44 45`。静态局部变量的存储空间不随着函数的调用和返回而变动，所以不受函数空间大小的限制。

## 动态存储期

但是这些都不适合链表。因为链表中每一个节点都是独立的，我们需要**手动控制**何时创建一个节点，何时令一个节点消亡。我们称那些可以在运行期间控制何时分配内存、释放内存的变量拥有动态存储期（Dynamic storage duration）。

我们通过 new 表达式手动**向操作系统申请**一片内存，并进行初始化。

| 运算符     | 名称          | 作用                                    |
| ---------- | ------------- | --------------------------------------- |
| `new T`    | new 运算符    | 获取一个非数组的 `T` 类型变量的存储空间 |
| `delete p` | delete 运算符 | 将 `p` 指向的存储空间释放（稍后解释）   |

new 表达式 `@"new" T@` 的结果是一个指向 `@T@` 类型的指针，这个指针所存放的地址就是刚刚申请到的那片存储空间。比如：
```cpp
int* ptr{nullptr};
ptr = new int;
```
这里，`ptr` 这个指针赋值为 new 表达式申请的地址。你可以通过这个指针来对这个刚刚得到的存储空间进行操作。比如：
```cpp
*ptr = 42;
```
为了体现动态存储期的特点，我们这样写：
```cpp codemo(show)
#include <iostream>
using namespace std;
// 获得一个存储空间，并赋值为 value
int* getSpace(int value) {
    int* ptr{new int};
    *ptr = value;
    return ptr;
}
int main() {
    int* ptr{nullptr};
    cout << "Continue?" << endl;
    if (cin.get() == 'y')  {
        ptr = getSpace(42);
        cout << *ptr << endl;
    }
    delete ptr; // 见后文
}
```
这里，`getSpace` 函数用于获取一片空间，并将指向这个空间的指针返回。而 main 函数中，是否获取这个空间取决于运行期间的输入：如果我们的输入是 `y`，则获取空间并存放变量；否则不做任何事情，也不会有任何变量被定义。而且，`ptr` 指向的这块存储空间可以在任何场合下访问：我们既可以在 `getSpace` 函数中给它赋值，也可以在 main 函数中将它的值输出。这是全局变量和局部变量都无法实现的，也是我们之后实现链表的必需手段。

new 表达式在分配内存完成后会自动进行初始化。你可以把初始化器放在 new 表达式中，比如：
```cpp
new int{42};
```
这样，这块内存就会执行 `{42}` 这个初始化。这个语法在分配结构体内存时很有用，比如下面的代码：
```cpp
struct Node {
    int data;
    Node* next;
};
void f() {
    Node* head{new Node{42, nullptr}};
}
```

通过 new 表达式分配到的内存**必须**要用 delete 表达式释放。比如：
```cpp
int* ptr{new int};
// [...] 对 *ptr 的操作
delete ptr;
```
当执行 `delete ptr;` 后，`ptr` 指向的内存空间**归还给操作系统**，因此 `*ptr` 成为了非法操作——这片存储空间已经不能再用了！我们在删除链表节点的时候，就需要执行这样的操作。

!> new 到的存储空间用 delete 释放，这是一个必须养成的编程习惯。**如果 new 完不 delete，可能导致严重的内存泄漏问题**。所以请务必细心编写你的代码。

## 总结

最后我们用一张表来总结这些存储期。如果上面的内容没有太看懂，希望这张表能够帮你理解。

<div class="table-wrapper">
<table>
<thead>
    <tr>
        <th>存储期</th>
        <th>常见情形</th>
        <th>何时分配内存</th>
        <th>何时初始化</th>
        <th>何时释放内存</th>
    </tr>
</thead>
<tbody>
    <tr>
        <th rowspan="2">自动存储期</th>
        <td>复合语句中声明的变量</td>
        <td>进入复合语句时</td>
        <td>执行声明语句时</td>
        <td>离开复合语句时</td>
    </tr>
    <tr>
        <td>函数形参</td>
        <td colspan="2" align="center">调用函数时</td>
        <td>从函数返回时</td>
    </tr>
    <tr>
        <th rowspan="2">静态存储期</th>
        <td>全局变量</td>
        <td rowspan="2">程序启动时</td>
        <td>程序启动时<sub>（常量初始化）</sub></td>
        <td rowspan="2">程序退出时</td>
    </tr>
    <tr>
        <td>静态局部变量</td>
        <td>第一次执行声明语句时</td>
    </tr>
    <tr>
        <th>动态存储期</th>
        <td>通过 new 表达式获得内存</td>
        <td colspan="2" align="center">执行 new 表达式时</td>
        <td>执行 delete 表达式时</td>
    </tr>
</tbody>
</table>
</div>

> 除了上述三种存储期，还有线程存储期（Thread storage duration）。
