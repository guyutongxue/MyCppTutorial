# 预置比较

我们知道，一个结构体在某些情况会自动生成一些成员函数，包括：
- 预置默认构造函数
- 预置复制构造函数
- 预置析构函数
- 预置复制赋值重载

C++20 引入了新的预置函数——预置比较运算符。自定义的类类型对象是无法比较的；等于和不等于运算符都无法使用：

```cpp
struct Coord {
    int x, y;
};
int main() {
    Coord a{1, 2};
    Coord b{1, 3};
    a == b; // 编译错误：operator== 未定义
}
```

但通过显式地指明使用预置比较运算符，就可以添加全部六个（或七个）比较运算符：

```cpp
#include <compare> // 使用预置比较必须引入
struct Coord {
    int x, y;
    // 通过 =default 指明使用预置比较
    auto operator<=>(const Coord&) const = default;
};
int main() {
    Coord a{1, 2};
    Coord b{1, 3};
    a == b; // false
    a < b;  // true
    b >= a; // true
    b != a; // true
}
```

停停停，太多新鲜事物了。最奇怪的就是这个 `operator<=>`，它是什么意思呢？这个东西叫做三路比较运算符（Three-way compare operator），俗称飞船运算符（Spaceship operator）。

## 三路比较运算符

| 运算符 | 名称           | 作用                           |
| ------ | -------------- | ------------------------------ |
| `<=>`  | 三路比较运算符 | 用以快速生成其它六种比较运算符 |

三路比较运算符是用来比较的。它与其它六个比较运算符的最大不同就是这个“三路”。原先六个运算符可以称为“两路比较”，因为它们运算的结果只有两种可能：`true` 或 `false`。而 `<=>` 是三路的，意味着它的运算结果有三种可能——具体来说，这三种结果分别是 $\tt greater$、$\tt equal$ 和 $\tt less$。

先不管这三种结果具体是什么东西，看一下下面的例子：
- `1 <=> 2` 的结果是 $\tt less$。
- `0 <=> 0` 的结果是 $\tt equal$。
- `3 <=> 1` 的结果是 $\tt greater$。
- ……

可以这样理解 `<=>`：`a <=> b` 的结果就是表达式 `a - b` 的“正负性”：如果是“负数”，那么 `a <=> b` 就是 $\tt less$；如果是“正数”，那么 `a <=> b` 就是 $\tt equal$；同理如果 `a - b` 得到零，那么 `a <=> b` 的结果就是 $\tt equal$。事实上，[第四章提到过的 `std::strcmp`](../../ch04/pointer/pointer_and_array.md#c-风格字符串库) 就是 C 风格字符串的三路比较：比如它返回正数时就代表第一个实参大于第二个实参。这样的设计使得其它六个运算符都可以从 `<=>` 的结果推出：
- `a > b` 等价于 `a <=> b` 为 $\tt greater$；
- `a >= b` 等价于 `a <=> b` 为 $\tt greater$ 或 $\tt equal$；
- `a == b` 等价于 `a <=> b` 为 $\tt equal$；
- `a <= b` 等价于 `a <=> b` 为 $\tt less$ 或 $\tt equal$；
- `a < b` 等价于 `a <=> b` 为 $\tt less$；
- `a != b` 等价于 `a <=> b` 为 $\tt greater$ 或 $\tt less$。

因此 `<=>` 最大的作用在于一旦定义了它，就相当于定义了 `<` `<=` `>=` 和 `>` 等比较运算符。在代码中使用这些比较运算符都相当于调用 `operator<=>`，编译器会按照刚刚的等价关系来推导出两路比较的结果。

目前为止，你至少对 `<=>` 这个东西有一个初步的认识了。接下来我要介绍 C++ 中如何定义 $\tt greater$、$\tt equal$ 和 $\tt less$ 这三种结果；但为此必须要引入一些数学知识。

## 序关系

> **基本概念介绍** 我不清楚读者的数学基础，下为后文要用到的基础概念。
> - 对于集合 $A$ 和 $B$，$A\times B=\{\lang x, y\rang\mid x\in A,y\in B\}$ 是 $A$ 和 $B$ 的**笛卡尔积**，其中 $\lang x,y\rang$ 是有序二元组。
> - 集合 $S$ 上的**二元关系** $R$ 是指 $S\times S$ 上的任意子集。
> - 对于 $S$ 上的某个二元关系 $R$，$\lang a, b\rang\in R$，则称 $a, b$ 具有 $R$ 关系，记作 $aRb$。
>   - 例：在实数集 $\mathbb R$ 上，小于等于 $\leqslant$ 是其上的一个二元关系。一般的写法 $3\leqslant5$ 即 $\lang 3, 5\rang\in\leqslant\subseteq\mathbb R\times\mathbb R$。

<style>
.bordered {
    border: 1px solid var(--c-text); 
    padding: 0 1em;
    margin-bottom: 0.5em;
}
</style>
<div class="bordered">

若集合 $S$ 上的二元关系 $\preccurlyeq$ 满足：
1. **自反性**：对于 $\forall a\in S$，$a\preccurlyeq a$；
2. **传递性**：对于 $\forall a, b, c\in S$，若 $a\preccurlyeq b$ 且 $b\preccurlyeq c$，则 $a\preccurlyeq c$；

则称 $\preccurlyeq$ 是**预序关系**（Preordering）。

</div>
<div class="bordered">

若集合 $S$ 上的二元关系 $\lesssim$ 满足：
1. **完全性**：对于 $\forall a, b\in S$，$a\lesssim b$ 或 $b\lesssim a$。
2. **传递性**：对于 $\forall a, b, c\in S$，若 $a\lesssim b$ 且 $b\lesssim c$，则 $a\lesssim c$；

则称 $\lesssim$ 是**弱序关系**（Weak ordering，又称预全序关系 Total pre-ordering）。完全性蕴含了自反性；因此弱序关系必然是预序关系。

</div>
<div class="bordered">

如果二元关系 $\leqslant$ 满足：
1. **完全性**：对于 $\forall a, b\in S$，$a\lesssim b$ 或 $b\lesssim a$。
2. **传递性**：对于 $\forall a, b, c\in S$，若 $a\lesssim b$ 且 $b\lesssim c$，则 $a\lesssim c$；
3. **反对称性**：对于 $\forall a, b\in S$，若 $a\preccurlyeq b$ 且 $b\preccurlyeq a$，则 $a = b$。

则称 $\leqslant$ 是**全序关系**（Total ordering）。显然，全序关系必然是弱序关系。

</div>

定义列完了。这里介绍了三种序关系：预序关系、弱序关系和全序关系。直观上来看一些例子：
- 全序关系是最常见的：常见的数集比如整数域 $\mathbb N$ 上，小于等于 $\leqslant$ 就是全序关系。自反性是显然的；传递性也很显然；完全性是指，任何两个整数之间都有大小关系，$a$ 要么大于等于 $b$，要么小于等于 $b$。 
- 弱序关系比较少见。举一个例子，对字符串按字典序排序，但忽略大小写。此时，`aBc` 和 `Abc` 在这种序关系定义下，前者既不小于后者，也不大于后者。但他们两个实质上也不相等，只能说在序关系下等价。弱序关系保证每两个元素之间都有大小关系，但没有反对称性——“既不大于也不小于”推导不出相等。其实之前在讲排序算法时也接触过类似的场景：结构体 `{1, 2}` 和 `{1, 3}` 按第一分量排序时，两者排序上“等价”但不相等。
- 预序关系偶尔能见到。对于计算机内的浮点数来说，其上的小于等于 `<=` 实际是一个预序关系。浮点数计算中引入了一个叫做**非数**（Not-a-number，**NaN**）的特殊值。NaN 和任何浮点数都没有 `<=` 关系，即对于任意浮点数 $x$， $\lang\mathtt{NaN}, x\rang\notin$ `<=`，$\lang x,\mathtt{NaN}\rang\notin$ `<=`。因此浮点数上的 `<=` 不具有完全性。此外，浮点数还定义了正零、负零两个相等但不等同的值，因此浮点数上的 `<=` 也不具有反对称性。

回到 C++，`<=>` 的返回值可能是 `std::partial_ordering`、`std::weak_ordering` 或 `std::strong_ordering` 类型的值：
- 如果 `<=>` 返回 `std::partial_ordering` 类型的值，意味着其所导出的六种运算符的运算结果满足预序关系；
- 如果 `<=>` 返回 `std::weak_ordering` 类型的值，意味着其所导出的六种运算符的运算结果满足弱序关系；
- 如果 `<=>` 返回 `std::strong_ordering` 类型的值，意味着其所导出的六种运算符的运算结果满足全序关系。

> 一般来说，标准库要求基于比较的算法（如 `rg::sort`）中使用的比较运算符尽可能是全序的；否则可能导致实现定义行为（对于弱序关系）或未定义行为（对于预序关系）。这也意味着对一个浮点类型的范围排序时，如果其中包含 NaN，则导致未定义行为。

这三个类都定义了 `less` `equivalent` 和 `strong` 三个静态成员，表明三路比较的返回结果。比如，整数类型的三路比较是 `std::strong_ordering` 类型的，那么 `1 <=> 2` 的返回值就是 `std::strong_ordering::less`。浮点类型的三路比较是 `std::partial_ordering` 类型的，那么 `3.14 <=> 3.14` 的返回值就是 `std::partial_ordering::equivalent`。

此外，由于预序关系不保证所有元素都可比较；故还存在额外的 `std::partial_ordering::unordered` 静态成员，指示某次三路比较的结果是两者不可比。`std::partial_ordering::unordered` 导出的 `<` `<=` `>=` `>` 运算符结果都是 `false`。

```cpp codemo
#include <compare> // 三路比较相关设施定义于此
#include <limits> // std::numeric_limits，见下

// 获取一个值为 NaN 的 double 类型常量
constexpr double NaN = std::numeric_limits<double>::quiet_NaN();

int main() {
    42 <=> 42; // std::strong_ordering::equivalent
    NaN <=> 1.0; // std::partial_ordering::unordered
    // codemo hide

    // static_assert 是静态断言；如果括号内表达式为 false 导致编译错误
    static_assert(42 <=> 42 == std::strong_ordering::equivalent);
    static_assert(NaN <=> 1.0 == std::partial_ordering::unordered);
    // codemo show
}
```

## 三路比较运算符重载

正如最初代码中展现的，可以在类中声明如下的预置三路比较函数：
```cpp
struct S {
    auto operator<=>(const S&) const = default;
    // 或者
    std::strong_ordering operator<=>(const S&) const = default;
    // 或者
    std::weak_ordering operator<=>(const S&) const = default;
    // 或者
    std::partial_ordering operator<=>(const S&) const = default;
};
```

这四种声明方式的区别仅在于函数返回值。它决定了整个结构体上的序关系是全序、弱序还是预序。如果使用 `auto` 作为返回值类型，编译器会根据该类的成员、基类自动使用最严格的序关系。除了一些极端情形，一般用 `auto` 就足够了。

当使用预置的三路比较运算符重载时，编译器会生成类似这样的代码：

```cpp codemo
#include <compare>
struct S {
    // 假设这里有三个成员 a b c…
    int a;
    double b;
    int c;

    // 下为编译器生成的预置三路比较
    // 由于包含浮点数成员，所以是 std::partial_ordering
    std::partial_ordering operator<=>(const S& rhs) const {
        constexpr auto EQUAL{std::partial_ordering::equivalent};
        if (auto cmp{a <=> rhs.a}; cmp != EQUAL) return cmp;
        if (auto cmp{b <=> rhs.b}; cmp != EQUAL) return cmp;
        return c <=> rhs.c;
    }
};
// codemo hide
int main() {
    S a{1, 2.0, 3};
    S b{1, 3.0, 2};
    a <=> b; // std::partial_ordering::less
    a > b; // false
}
```

用人话说就是：先三路比较第一个成员，如果比较结果不是 $\tt equal$ 就直接返回它；否则比较第二个成员，如果不是 $\tt equal$ 就直接返回它；然后再比较第三个成员……这样一直比较到成员列表中的最后一个数据成员。也可以形象地解释为按照成员列表“字典序”比较。

这种比较方式是很常用的；你可以通过调整成员列表的顺序来控制比较方法。如果你不想这样做，你也可以像这样手动提供三路比较：

```cpp codemo
#include <compare>
struct S {
    int a;
    double b;
    int c;

    std::partial_ordering operator<=>(const S& rhs) const {
        // 这次，先比较 c 后比较 b
        if (auto cmp{a <=> rhs.a}; cmp != 0) return cmp;
        if (auto cmp{c <=> rhs.c}; cmp != 0) return cmp;
        return b <=> rhs.b;
    }
};
// codemo hide
int main() {
    S a{1, 2.0, 3};
    S b{1, 3.0, 2};
    a <=> b; // std::partial_ordering::greater
    a > b; // true
}
```

但如果只是调换成员比较顺序的话，可以通过 `std::tie` 来简化。`std::tie` 可以生成定义了三路比较的 `std::tuple` 类型：

```cpp codemo
#include <compare>
struct S {
    int a;
    double b;
    int c;

    // codemo show
    std::partial_ordering operator<=>(const S& rhs) const {
        return std::tie(a, c, b) <=> std::tie(rhs.a, rhs.c, rhs.b);
    }
    // codemo hide
};
int main() {
    S a{1, 2.0, 3};
    S b{1, 3.0, 2};
    a <=> b; // std::partial_ordering::greater
    a > b; // true
}
```

## 预置等于运算符

用三路比较导出等于、不等于运算符会出现一个小小的问题：存在性能损失。举一个字符串的例子，判断两个字符串相等与否可以先判断它们的长度是否相同：如果不同的话，那两个字符串肯定不相等。但如果用三路比较，就必须每个字符遍历一遍。因此，C++ 不会将 `==` `!=` 两个运算符通过 `<=>` 实现。取而代之的，C++ 引入了新的**预置等于运算符**：

```cpp
#include <compare>
struct S {
    int a;
    double b;
    int c;

    auto operator<=>(const S&) const = default;
    // 看下面
    bool operator==(const S&) const = default;
};
```

使用预置等于运算符时，会生成一个简单的等于运算符重载定义。其内容就是，按成员列表从上到下依次用 `operator==` 比较每个成员，在首个不等的地方返回 `false` 或最终返回 `true`。此外，`!=` 运算符可以通过 `==` 运算符导出，即仅定义 `operator==` 就可以使用 `!=` 运算符。在实践上，你可以使用预置的 `operator<=>` 和一个自定义的、有优化的 `operator==`：这样既减少了代码长度，又最大程度的提高性能。

此外，如果你的 `operator<=>` 是预置的话，编译器也会帮你预置一个 `operator==`：这样仅仅一个 `operator<=>` 就能处理好全部七个比较运算符，非常方便。但如果 `operator<=>` 是自定义的的话，就需要手动指明 `operator==`（预置或者自己定义），否则 `==` `!=` 运算符无法使用。

