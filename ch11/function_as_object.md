# 函数也即对象

考虑一个函数，传入整数类型 $a$、$b$ 作为参数，返回 $a+(a+1)+\cdots+(b-1)+b=\displaystyle\sum_{i=a}^bi$。那么，这个函数可以这样实现：

```cpp
int sum(int a, int b) {
    int res{0};
    for (int i{a}; i <= b; i++) {
        res += i;
    }
    return res;
}
```

也可以按照之前说的函数式风格来实现它：

```cpp
int sum(int a, int b) {
    return a > b ? 0 : a + sum(a + 1, b);
}
```

倘若除此之外，我们还需要实现 $\displaystyle\sum_{i=a}^bi^2$ 和 $\displaystyle\sum_{i=a}^b\frac1{i^2}$。当然可以类似地写出：

```cpp
int sum_sq(int a, int b) {
    return a > b ? 0 : a * a + sum_sq(a + 1, b);
}
double sum_sq_rv(int a, int b) {
    return a > b 
        ? 0.0 
        : 1.0 / (a * a) + sum_sq_rv(a + 1, b);
}
```

观察这三个函数的实现方法，你会发现它们是类似的。基本上，都长成这个模样：
```cpp
double sth(int a, int b) {
    return a > b ? 0.0 : 啥啥啥 + sth(a + 1, b);
}
```

而这里的“啥啥啥”则是一个关于 $a$ 的函数。在 `sum` 里，“啥啥啥”是恒等函数 $f_1(a)=a$，在 `sum_sq` 里是 $f_2(a)=a^2$，在 `sum_eq_rv` 里，则是 $f_3(a)=\dfrac1{a^2}$。其余的部分，则完全相同。对于这种大量重复代码的情形，我们希望用一个通用的函数来处理；而不同的部分则作为函数的参数。换句话说，我们希望“啥啥啥”是一个参数：

```cpp
double sum(int a, int b, double term(int)) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}
```

这里，我就使用了 `term` 参数。根据刚才的分析，它是一个关于 `a` 的“函数”（传入一个 `int`，返回 `double` 类型）。使用的时候，需要这样做：

```CPP
#include <iostream>

// f1(a) = a
double identity(int a) {
    return a;
}

// f2(a) = a^2
double square(int a) {
    return a * a;
}

double square_rev(int a) {
    return 1.0 / (a * a);
}

double sum(int a, int b, double term(int)) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    // 1 + 2 + 3 + 4 + 5 = 15
    std::cout << sum(1, 5, identity) << std::endl;

    // 3^2 + 4^2 + 5^2 = 50
    std::cout << sum(3, 5, square) << std::endl;

    // ~ 1.63 ~= π^2/6
    std::cout << sum(1, 100, square_rev) << std::endl;
}
```

观察 main 函数中调用 `sum` 的方法。我们“传入”对应的 `term` 函数以决定求和的每一项，然后 `sum` 就会按照这样的规则去求值。

看上去很美好，函数作为实参，调用函数类型的形参……但实际上，背后的语法并没有那么简单；容我再稍微费一些口舌。实际上，C/C++ 不允许函数作为参数，这里所有将函数传参的行为实际上传递的是[指向函数的指针](ch04/pointer/pointer_def_2#idx_函数指针)。