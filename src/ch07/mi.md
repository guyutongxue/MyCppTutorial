# 多重继承 <Badge type="warning" text="TBC" /> <Badge type="tip" text="选读" />

C++ 中提供了**多重继承**（Multiple Inheritance, MI）的特性，其含义是一个派生类可以从多个基类继承。

::: tip
\[TODO\]
:::

## 用法 1：用基类代替成员

基类在语义上类似于打包好的成员，所以将基类用作面向对象中“部分于”的实现是理论上可行的；尽管这样会让代码读起来更加费劲。

比如，我们假设有一个管理无符号数（自然数）的类：

```cpp
class UnsignedInteger {
private:
    unsigned int value;

public:
    // [...]
};
```

那么根据“有符号数=无符号数+符号性”这种组件分解方式，可以这样设想管理有符号数（整数）的类：

```cpp
class SignedInteger {
private:
    UnsignedInteger numeric;
    bool sign;
};
```

但是可以考虑 `UnsignedInteger` 中定义了 `abs` 方法返回这个整数的值，那么 `SignedInteger` 类可以通过继承来复用：

```cpp
class SignedInteger : public UnsignedInteger {
    // [...]
};

int main() {
    SignedInteger si;
    si.abs(); // 调用 UnsignedInteger::abs，恰好为此数的绝对值
}
```

上面是一个将继承用作除了“是”以外的语义的一个例子。如果一个类有多个类类型的组成部分，则将它们分别写在继承列表里也是一种选择。

比如——类似地，从一个有符号整数、“小数部分”构造一个“十进制小数”：

```cpp
class DecimalDigits {
private:
    unsigned int value;
    unsigned int digitLength;
    // [...]
};
// 小数 = 有符号的整数部分 + 小数部分
class Decimal : public SignedInteger, public DecimalDigits {
    // [...]
};
```

继承的写法可以让 `Decimal` 中的全部方法都复用自 `SignedInteger` 或 `DecimalDigits`。

但是缺点也是显而易见的：这种写法相当诡异而且会引起误会。公开继承在面向对象的编程范式中通常只会指代“是”，但这里的关系并不能称为“是”——不能得出“小数是整数部分”、“有符号数是无符号数”这种明显荒谬的答案。所以，如果如果必须用基类作为一部分的语义的话，最佳的实践是把继承改为保护继承或私有继承。

```cpp
class SignedInteger : protected UnsignedInteger {
public:
    using UnsignedInteger::abs; // 手动公开内部可能用到的方法
};
```


## 用法 2：同时“是”多个类

## 虚基类
