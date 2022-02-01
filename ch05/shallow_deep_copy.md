# 浅复制与深复制

终于回到了我们的 `String` 结构体。首先我先给出我们已有的代码：
```cpp
struct String {
    char* str;

    // 构造函数的三个重载，包含一个默认构造；定义略去
    String();
    String(const char* initVal);
    String(unsigned num, char c);
    
    // 求字符串长度
    unsigned length() {
        return len;
    }
    // 赋值用，但我们还没有具体解释
    void assign(const String assignVal) {
        delete[] str;
        len = assignVal.len;
        str = new char[len + 1];
        for (unsigned i{0}; i <= len; i++)
            str[i] = assignVal.str[i];
    }
private:
    unsigned len;
};
```

看看这个例子吧：
```cpp
#include <iostream>
struct String; // 定义略
void f(String a) {
    a.str[0] = 'B';
}
int main() {
    String sth("Dog");
    f(sth);
    std::cout << sth.str << std::endl;
}
```
结果输出是 `Bog`。发生什么事了？从直觉上来讲，`f` 函数并不是引用传参的，所以它的 `a` 和 `main` 的 `sth` 应该是互相独立的两个变量。但是我们对 `a` 的更改竟然作用到了 `main` 的 `sth`？这是为什么呢？

我们已经知道的是，这里的传参调用了复制构造函数；而复制构造函数我们并没定义，所以是预置复制构造——将成员逐一复制初始化。假设在某次运行时，`main` 中 `sth` 的成员分别为：
- 成员 `len` 值为 `3`；
- 成员 `str` 值为 `0x873c20`。

其中，`0x873c20` 地址处存放了字符串 `"Dog"`。那么用 `sth` 复制初始化 `f` 中的 `a`，我们得到了什么？

![](https://z3.ax1x.com/2021/01/23/s7OYct.png ':size=500')

嗯，确实 `str` 和 `a` 是两个独立的、相同的对象。但问题出在了成员 `str` 不是数组而是指针！这时，两个指针指向的位置也是相同的——所以，`a.str[0]` 和 `sth.str[0]` 其实是同一个变量。这就是为什么更改了 `a.str[0]` 的值也会作用到 `sth` 上。

让我们借用 JavaScript 的两个概念来说明这个问题。当成员中含有指针时，朴素地把指针当成普通变量一样直接复制，我们称这种复制方法为“浅复制”。浅复制的结果并不是两个完全独立的变量：因为它们的指针指向同一处，当使用这一处内存的东西时就会出现麻烦。

所以，我们需要的是“深复制”。深复制的效果应当类似这样：

![](https://z3.ax1x.com/2021/01/23/s7Xn8s.png ':size=500')

也就是：不复制指针的值，而是将指针所指向的那片内存进行复制，然后让两个指针分别指向这两片复制出来的内存。那么怎么实现呢？显然，预置复制构造只能实现“浅复制”，“深复制”需要靠我们自己写。

```cpp
struct String {
    String(const String& initVal) {
        len = initVal.len;                 // 复制长度
        str = new char[len + 1];                // 申请新的内存空间
        for (unsigned i{0}; i <= len; i++)
            str[i] = initVal.str[i];       // 然后把内存里的值逐一复制
    }
};
```

然后再来试试 `f` 函数，这一次它不会再更改 `main` 中 `sth` 的内容了。可喜可贺。

基于“浅复制”和“深复制”的原理，请读者回过头来再看一看我没有细讲的 `assign` 成员函数。它本质上仍然是做“深复制”的赋值，而避免默认的赋值导致的“浅复制”。我这里仅仅把 `assign` 的函数类型稍作微调：
```cpp
void assign(const String& assignVal);
```
将参数类型改为 `const T&` 来避免复制。至于工作原理，这里不再展开；而目前 `assign` 函数隐含的小问题也留待下一章再作调整。