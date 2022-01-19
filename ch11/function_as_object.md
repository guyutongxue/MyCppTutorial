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

而这里的“啥啥啥”则是一个关于 $a$ 的函数。在 `sum` 里，“啥啥啥”是恒等函数 $f_1(a)=a$，在 `sum_sq` 里是 $f_2(a)=a^2$，在 `sum_eq_rv` 里，则是 $f_3(a)=\dfrac1{a^2}$。