# 高阶函数

让我们继续“函数也即对象”的讨论。这一次，尝试利用 Lambda 表达式的语法在函数中返回函数。

考虑之前计算 $\displaystyle\sum_{i=a}^b i^n$ 的例子。当时，我使用了 Lambda 表达式 `[n](int a) { return std::pow(a, n); }` 作为 `sum` 的参数，很轻松地实现了功能。但其实还可以写出更“复杂”的代码：

```CPP
#include <iostream>
#include <cmath>

template<typename F>
double sum(int a, int b, F term) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

// 注意这个函数
auto powGenerator(double n) {
    return [=] (int a) { return std::pow(a, n); };
}

int main() {
    int n;
    std::cin >> n;
    std::cout << sum(1, 5, powGenerator(n)) << std::endl;
}
```

我来仔细解读以下这个代码。它的核心是使用了 `powGenerator` 这个函数。它会根据传入的参数 `n` 返回对应的 Lambda 表达式 `[=] (int a) { return std::pow(a, n); }`，而这正是上一种解法中的 Lambda 表达式。所以，只要通过 `powGenerator(n)` 的调用，就能获取到我们想要的 Lambda 表达式。

语法上注意一点：由于 Lambda 表达式的类型是匿名的，所以我们不得不用 `auto` 作为 `powGenerator` 的返回值类型。如果你的编译器不支持这个语法，那这里只能用模板类型了。

尽管这种写法代码稍微多了一点，但如果 `[=] (int a) { return std::pow(a, n); }` 这个东西在整个代码里多次出现的话，那 `powGenerator` 就会减少这些重复，方便代码调试和重构。

像这种，返回函数的函数有一个专业的术语——“高阶函数”（Higher order function）。它其实在数学里很常见。比如函数的复合运算 $\circ$ 就是一个高阶函数。函数的复合运算是一个二元运算，它接受两个函数 $f$ 和 $g$，$f\circ g$ 生成一个新的函数，作为复合运算的结果。$f\circ g$ 的定义是，$(f\circ g)(x)=f(g(x))$。

可以在 C++ 中实现简单的复合运算。下面的函数 `comb` 就是这样的：

```CPP
#include <iostream>

template<typename F, typename G>
auto comb(F f, G g) {
    return [=](int x) { return f(g(x)); };
}

int f(int x) { return x + 1; }
int g(int x) { return x * 2; }
int main() {
    std::cout << comb(f, g)(3) << std::endl;
    std::cout << comb(g, f)(3) << std::endl;
}
```

这份代码中，给出了函数 $f$ 和 $g$ 的定义，然后计算了 $(f\circ g)(3)$ 和 $(g\circ f)(3)$ 的值。运行程序，发现它们不相等，证实了 $\circ$ 不满足交换律。

但 $\circ$ 是满足结合律的；下面的代码尝试去验证这个事实：

```CPP
#include <iostream>

template<typename F, typename G>
auto operator*(F f, G g) {
    return [=](int x) { return f(g(x)); };
}

auto f = [](int x) { return x + 1; };
auto g = [](int x) { return x * 2; };
auto h = [](int x) { return x * x; };
int main() {
    std::cout << ((f * g) * h)(3) << std::endl;
    std::cout << (f * (g * h))(3) << std::endl;
}
```

我在这里玩了个花样：将 `comp` 改名为 `operator*`，也就是重载二元的 `*` 运算符。这样，原先 `comp(f, g)` 就可以写成 `f * g` 这种更易读的形式。

> 但为了让重载生效，我需要将 `f` `g` `h` 改成 Lambda 表达式而非函数。因为运算符重载只在类类型之间生效（回忆[非成员的运算符](/ch06/nonmember_operator#非成员的运算符重载形式)这一节，运算符重载总要求至少一个参数是类类型），故函数指针之间的运算不会考虑自定义的重载。而 Lambda 表达式作为匿名类类型，会考虑这些重载。

还有一个常见的高阶函数是微分算子 $\dfrac{\mathrm d}{\mathrm dx}$。$\dfrac{\mathrm d}{\mathrm dx}$ 可作用在一个函数 $f$ 上，定义 $\displaystyle\frac{\mathrm d}{\mathrm dx}f(x)=f'(x)=\lim_{\Delta x\to0}\frac{f(x+\Delta x) - f(x)}{\Delta x}$。大家都知道的，称 $\dfrac{\mathrm d}{\mathrm dx}f$ 这个运算结果为 $f$ 的导函数。

在代码中很难模拟极限过程，但如果取这个 $\Delta x$ 为比较小的值，那或许能得到近似的 $\dfrac{\mathrm d}{\mathrm dx}f$ 的结果。下面的函数 `d` 实现了近似的微分算子 $\dfrac{\mathrm d}{\mathrm dx}$。（其中，取 $\Delta x=10^{-6}$，即 `DX`。）

```CPP
#include <iostream>

constexpr double DX{1e-6};

template<typename F>
auto d(F f) {
    return [=](double x) {
        return (f(x + DX) - f(x)) / DX;
    };
}

auto f = [](double x) { return x * x; };
int main() {
    std::cout << f(5) << std::endl;
    std::cout << d(f)(5) << std::endl;
}
```

比如当 $f(x)=x^2$ 时，数学上即可知道 $\dfrac{\mathrm d}{\mathrm dx}f(x)=2x$。上面的代码验证了这个结果。

可以见得，函数式编程和数学的关系非常紧密。因此数学家往往偏爱函数式编程；数学中的大量理论（比如抽象代数）也在函数式编程中得以应用。但我们这本书的目的仍然是 C++ 教学而非数学研究，所以从下一节开始我将回归到 STL 算法部分的讲解。这几节函数式编程的介绍中，我们学习了不少新的思想和语法；它们马上就将派上用场。

> 本节中的所有 Lambda 表达式都使用复制捕获。这是因为，当引用捕获的 Lambda 出现在返回值时，相当于返回了[悬垂引用](/ch05/reference#悬垂引用)；这是显然错误的。比如，若 `[&] (int a) { return std::pow(a, n); }` 引用捕获了 `powGenerator` 的形参 `n`，那等到这个 Lambda 表达式被调用之时（即在 `sum` 函数执行时），`n` 所在的 `powGenerator` 函数已经释放，`n` 已经不存在了。