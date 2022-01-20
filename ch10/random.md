# 伪随机数生成

伪随机数（Pseudo-random number）是指用确定性算法生成的一系列数。对于较好的算法，所有数出现的频率都是均匀的，且整个序列没有明显的规律可循。

注：真随机数一般是依赖于物理环境的随机生成器，可以取自量子或环境噪音等。有些计算机处理器会内置真随机数模块。

一般的伪随机数的生成需要一个**种子** $x_0$，依赖某个特定的函数 $f$ 生成后续的 $x_1, x_2,\cdots$（比如 $x_{i+1}=f(x_i)\ (i=0, 1,\cdots)$）。合适的 $f$ 可使得人很难观察到 $\{x_i\}$ 的规律。

## 现代伪随机数生成引擎

我首先介绍于 C++11 引入的伪随机数生成引擎。尽管它写起来复杂得很，但生成方法更科学、质量更高、可操作性更强。

C++ 将一些原子的伪随机算法包装为对象，称其为伪随机数**生成引擎**。C++ 标准库提供的四个生成引擎是：

| 引擎名                            | 说明                             |
| --------------------------------- | -------------------------------- |
| `std::random_device`              | 尽可能使用真随机生成器的生成引擎 |
| `std::linear_congruential_engine` | 使用线性同余算法的生成引擎       |
| `std::mersenne_twister_engine`    | 使用梅森旋转算法的生成引擎       |
| `std::subtract_with_carry_engine` | 使用带进位减算法的生成引擎       |

此外，C++ 标准库还提供了一系列引擎适配器，以提供更常用的标准算法，其中还包括 `std::default_random_engine` 作为实现定义的默认引擎（或其适配器）。

而且，不同的引擎或引擎适配器有不同的构造方法，看着就很晕很乱。但在日常没有特别要求的情形下：
- 用 `std::random_device` 生成最随机的数，但可能会很慢；
- 用 `std::default_random_engine` 快速地生成伪随机数，但若不设定种子，随机性可能很差。

所以，接下来我将这样演示代码：首先用 `std::random_device` 生成一个随机种子，随后用 `std::default_random_engine` 生成剩余的伪随机数序列。

### 构造生成引擎

所有的生成引擎（或引擎适配器，后略）都提供如下成员：
- 单参数的构造函数：提供一个种子（$x_0$）以生成后续随机数；
- 默认构造函数：默认种子/真随机生成；
- `operator()`：执行随机算法（$f$）产出一个随机数。

那么，我们就可以尝试生成一个随机种子：

```CPP
#include <iostream>
#include <random> // 所有现代伪随机数生成器皆定义于此头文件

int main() {
    std::random_device rd; // 构造真随机数生成引擎
    auto seed{rd()};       // 产出一个随机数
    std::cout << seed << std::endl; 
}
```

你可以多运行几次这个程序，可以发现每次输出的结果（理论上）都不一样。

有了种子之后，就可以带入伪随机数生成器了。

```CPP
#include <iostream>
#include <random>

int main() {
    std::random_device rd; // 构造真随机数生成引擎
    auto seed{rd()};       // 产出一个随机数作为种子
    
    // 用 seed 作为种子构造伪随机数生成器
    std::default_random_engine e(seed);

    std::cout << e() << std::endl; // 产出随机数
}
```

同样地，每次运行程序的结果都不一样。

### 构造服从分布的随机变量

但是，所有引擎生成的随机数类型是实现定义的。我们偶尔需要将随机数限定在一个范围内，或者服从特定的分布（如正态分布等）。幸运地，C++ 为我们提供了大量常见分布：离散均匀分布、连续均匀分布、两点（伯努利）分布、二项分布、负二项分布、几何分布、泊松分布、指数分布、$\Gamma$ 分布、正态分布、$\chi^2$ 分布、$F$ 分布、$t$ 分布等等。

所有的分布都提供如下成员：
- 构造函数（包括分布的参数）；
- `operator()`，传入一个生成引擎以生成下一个服从分布的随机值。

作为例子，我这里使用整数均匀分布 `std::uniform_int_distribution` 演示。

`std::uniform_int_distribution` 的构造函数带两个参数 `a` 和 `b`，代表生成随机数的上界（含）和下界（含）。比如，如果想要生成 $1$ 到 $6$ 的随机数，则

```CPP
#include <random>

int main() {
    std::uniform_int_distribution d(1, 6);
}
```

> `std::uniform_int_distribution` 是模板类，还可传入一个模板参数作为产出随机值的类型。这里的代码使用 CTAD 省略了模板参数。

生成的时候，向 `operator()` 传入一个引擎：

```CPP
#include <iostream>
#include <random>

int main() {
    // 产出种子
    std::random_device rd;
    auto seed{rd()};
    
    // 构造引擎
    std::default_random_engine e(seed);

    // 构造分布
    std::uniform_int_distribution d(1, 6);

    for (int i{0}; i < 10; i++) {
        int val{d(e)}; // d(e) 产出 1~6 的随机整数
        std::cout << val << std::endl;
    }
}
```

上述代码就会产出十个 $1\sim 6$ 的随机值，每次运行结果都不同。

类似地，`std::uniform_real_distribution` 产出均匀分布的浮点数（构造时传入上下界）；`std::normal_distribution` 产出服从正态分布的随机试验结果（构造时传入均值和方差）。更多的分布介绍，可参阅 [CppReference](https://zh.cppreference.com/w/cpp/numeric/random)。

## C 风格随机数生成（选读）

`<cstdlib>` 头文件（C 语言中为 `<stdlib.h>`）定义了两个函数和一个宏常量，以生成低质量的随机数。

每调用函数 `std::rand`，产出一个 `int` 类型的随机整数，取值范围从 `0` 到 `RAND_MAX`。其中 `RAND_MAX` 是一个可能很小（但不低于 `32767`）的常量。

但我们并未设置任何种子。`std::srand` 设置 `std::rand` 接下来产出随机数的种子。

```CPP
#include <iostream>
#include <cstdlib>
int main() {
    std::srand(42); // 以 42 作为随机数生成种子
    for (int i{0}; i < 10; i++) {
        int val{std::rand()}; // 产出 0~RAND_MAX 的随机数
        // （你可以用取模运算限制其范围）
        std::cout << val << std::endl;
    }
}
```

由于种子和算法固定，故有可能该程序每次运行的结果是相同的。为了生成随机化的种子，习惯上将表示当前时间的值 `std::time(nullptr)` 作为种子：

```CPP
#include <iostream>
#include <cstdlib>
#include <ctime> // std::time 定义于此
int main() {
    std::srand(std::time(nullptr)); // 以“当前时间”作为种子
    for (int i{0}; i < 10; i++) {
        int val{std::rand()}; // 产出 0~RAND_MAX 的随机数
        std::cout << val << std::endl;
    }
}
```