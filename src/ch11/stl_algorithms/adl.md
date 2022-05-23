# 实参依赖查找 <sub>选读</sub>

**实参依赖查找**（Argument-Dependent Lookup, ADL）是 C++ 中很恶心的一个语法细节。说实话，它在平常使用中几乎看不见、摸不着；但一旦深入某个标准库函数的实现，或者构建某些库的时候，ADL 就是绕不开的点。所以我在这一节稍稍展开一点，以此抛砖引玉。

实参依赖查找，顾名思义是一种“查找”。所谓的查找，就是“名字查找”（Name lookup）：程序中出现了一个名字，编译器需要确定这个名字指的是哪个声明引入的。最简单的例子是有限定查找（Qualified lookup）：

```CPP
#include <iostream>

namespace ns {
void f() {
    std::cout << "Called ns::f" << std::endl;
}
}

struct S {
    static void f() {
        std::cout << "Called S::f" << std::endl;
    }
};

void f() {
    std::cout << "Called ::f" << std::endl;
}

int main() {
    ns::f();
    S::f();
    ::f();
}
```

有限定查找指查找有限定符的名字。所谓限定符就是 `::` 出现的名字，比如命名空间名、类名等等。这里也包括全局命名空间 `::`，即上例中演示的 `::f`。当出现限定符时，这个名字就指代限定符所表示的命名空间（或类）中的声明，没有过多的歧义。

而无限定查找（Unqualified lookup）则略显麻烦。

```CPP
#include <iostream>
namespace ns {
void f() {
    std::cout << "Called ns::f" << std::endl;
}
}

void f() {
    std::cout << "Called ::f" << std::endl;
}

int main() {
    f(); // 显然，找到 ::f 而非 ns::f
}
```

上面的代码是比较简单的情形。名字 `f` 不带限定符，所以这是一个无限定查找。但和直觉不符的是，无限定查找并非一味地查找全局作用域（若局部作用域无那样的声明时）。比如下面的代码：

```CPP
#include <iostream>
namespace ns {
struct S { };
void f(ns::S x) {
    std::cout << "Called ns::f" << std::endl;
}
}

int main() {
    ns::S x{};
    f(x); // 找到 ns::f
}
```

首先，命名空间 `ns` 里定义了类 `S`，然后 `f` 期待一个 `ns::S` 类型的参数。随后，main 函数中发起一个无限定的 `f` 调用。这时尽管全局命名空间并不存在函数 `f`，但事实上编译器会找到 `ns::f`。这就是实参依赖查找：**当查找无限定的、被调用的函数名时，若实参的类型定义于某个命名空间 `ns`，则 `ns` 中的名字会被查找**。

比如这个例子中，main 函数中的对象 `x` 具有 `ns::S` 类型，且传入了无限定函数名 `f` 的调用中。那么，`ns` 命名空间下的所有名字都会纳入查找中。确实，`ns::f` 存在；故这里的 `f` 就指代 `ns::f`。

## 为什么引入 ADL？

引入 ADL 出于以下两点考量。第一是运算符重载，如果没有 ADL 的话，标准库下的运算符重载将全部不可见。比如 `std::ostream operator<<(std::ostream, int)` 这个非成员的运算符重载，它是定义于 `std` 命名空间的。换而言之，理论上应当这样使用：

```CPP
#include <iostream>

int main() {
    std::operator<<(std::cout, 42);
}
```

显然，我们期望运算符形式的写法，也就是 `std::cout << 42`。但如果没有 ADL，那 `std::operator<<` 这个运算符就看不见，在 `std::cout << 42` 里就找不到合适的 `<<` 了；而且我们也不喜欢 `std::cout std::<< 42` 这种莫名其妙的写法。所以，必须要有 ADL。这里，由于 `std::cout` 是 `std::ostream` 类型的，而 `std::ostream` 定义于 `std` 命名空间，从而查找运算符 `<<` 时需要考虑 `std::operator<<`。

```CPP
#include <iostream>

int main() {
    operator<<(std::cout, 42); // ADL 到 std::operator<<
    std::cout << 42;           // 同上
}
```

第二个考量则是友元函数。在[第九章中的一节](/ch09/friend_in_template)，提到了类模板的友元的最佳声明方式是将完整定义放入类的作用域内。如果采用这种声明方式，则该友元函数在全局命名空间其实是完全不可见的：

```CPP
struct S {
    template<typename T>
    friend void f(T t) {
        std::cout << "Called S::f" << std::endl;
    }
};

int main() {
    S s;
    f(s);  // 找到 S::f
//  f(42); // 编译错误
}
```

如果没有 ADL，那 `f(s)` 就也是编译错误——好家伙，友元函数白声明了，啥也干不了。还好，ADL 还有这样的规则：**若实参是类类型，则其类定义中的友元声明会纳入查找**。因此，实参 `s` 的类型 `S` 中的友元函数 `f` 被找到，可喜可贺。

## ADL 的缺点

ADL 的原罪在于引入了不符合直觉的编译器规则。一个很经典的问题如下：

```cpp
#include <algorithm>

struct S { /* [...] */ };

void f(S& a, S& b) {
    std::swap(a, b);
}

void g(S& a, S& b) {
    using std::swap; // 或者 using namespace std;
    swap(a, b);
}
```

这个例子中，`f` 函数和 `g` 函数是等价的吗？仔细想一想。

答案是否定的。考虑以下的完整代码：

```cpp
#include <algorithm>
#include <iostream>

struct S {
    friend void swap(S& a, S& b) {
        std::cout << "Called S::swap" << std::endl;
    }
};

void f(S& a, S& b) {
    std::swap(a, b);
}

void g(S& a, S& b) {
    using std::swap; // 或者 using namespace std;
    swap(a, b);
}

int main() {
    S a, b;
    f(a, b);
    g(a, b);
}
```

结果是，`g` 中调用了 `S::swap`，而 `f` 调用的则是标准库中的 `std::swap`。因此，看上去一样的 `f` 和 `g` 在实际表现上可能不同。这就是 ADL 反直觉的体现。

事实上，在正式的生产环境中更常用的是 `g` 函数的写法。因为，许多第三方库中的类会定义自己的、更高效版本的 `swap`（而不是基于三次复制的 `std::swap`；在复制开销很大时不太可取），那么 `g` 这种写法就会因 ADL 而考虑它们。反之，`f` 函数的写法则很老实地用 `std::swap`，丧失了优化机会。

## 定制点对象

第六章我提到过[函数对象](/ch06/special_operator_overload.md#idx_函数对象)，就是重载了 `operator()` 的类的对象。它在使用的时候和函数很像，都是出现在函数调用运算符的左侧；但它毕竟不是函数，所以**函数对象不会应用 ADL**。标准规定：如果当前作用域存在一个函数对象，其名字正是函数调用运算符左侧的名字，那么不进行 ADL。

```CPP
#include <iostream>

namespace ns {
struct S { };
void f(ns::S x) {
    std::cout << "Called ns::f" << std::endl;
}
void g(ns::S x) {
    std::cout << "Called ns::g" << std::endl;
}
}

template<typename T>
void f(T x) {
    std::cout << "Called ::f" << std::endl;
}
struct G {
    template<typename T>
    void operator()(T x) {
        std::cout << "Called ::g" << std::endl;
    }
};
G g;

int main() {
    ns::S x{};
    f(x); // 找到 ns::f；重载解析时它比 ::f 更好
    g(x); // 找到 ::g，因为它是函数对象，不进行 ADL，看不见 ns::g
}
```

上面的例子中，`g(x)` 并没有 ADL 到 `ns::g`，而是采用了重载解析中更差的 `::g`。这就体现函数对象的一个功能：**禁用 ADL**。如之前提到的，ADL 违背直觉的表现比较麻烦。下面的例子引入了用函数对象实现的 `my_std::swap`，它在一致性上优于函数 `std::swap`。

```CPP
#include <iostream>

namespace my_std {
struct Swap {
    template<typename T>
    void operator()(T& a, T& b) {
        std::cout << "Called my_std::swap" << std::endl;
    }
};
Swap swap; // 函数对象 my_std::swap
}

struct S {
    friend void swap(S& a, S& b) {
        std::cout << "Called S::swap" << std::endl;
    }
};

void f(S& a, S& b) {
    my_std::swap(a, b);
}

void g(S& a, S& b) {
    using my_std::swap; // 或者 using namespace my_std;
    swap(a, b);         // ADL 禁用，不会查找到 S::swap
}

int main() {
    S a, b;
    f(a, b); // my_std::swap
    g(a, b); // 也是 my_std::swap
}
```

原本效果不同的两种写法，通过函数对象禁用 ADL 后，效果变得一致了。这减少了程序员的心智负担。但它带来了另一个问题：`S::swap` 这两种写法都无法调用；根本没有简单的办法使用为 `S` 定制的 `S::swap`。但实际上这可以通过一些复杂的模板代码，让 `my_std::swap` 在有更好的 `swap` （比如这个例子中的 `S::swap`）可用时，将 `my_std::swap` 的调用**分发**到 `S::swap` 上；其余的情形使用默认的行为。这样实现的 `my_std::swap` 就是 `std::ranges::swap`，即约束版本的算法了。此时，不论是 `f(a, b)` 还是 `g(a, b)`，调用的都是 `S::swap`。

```CPP
#include <iostream>
#include <algorithm>

struct S {
    friend void swap(S& a, S& b) {
        std::cout << "Called S::swap" << std::endl;
    }
};

void f(S& a, S& b) {
    std::ranges::swap(a, b);
}

void g(S& a, S& b) {
    // 或者 using namespace std::ranges;
    using std::ranges::swap;
    swap(a, b);
}

int main() {
    S a, b;
    f(a, b); // 分发到 S::swap
    g(a, b); // 也会分发到 S::swap
}
```

像这样，约束版本的许多算法做了这些改进：
1. 使用函数对象以禁用 ADL，增强代码一致性；
2. 实现上，尽可能分发到定制版本代码（如 `S::swap`）。

满足这样要求（以及一些额外规定）的“仿函数实体”就称为**定制点对象**（Customized point object, CPO）。约束版本的算法很多都是定制点对象；尽管它们比函数复杂得多，但在实际使用上会更方便。

## niebloid

**niebloid** 是和 CPO 很相似的概念。它的含义很简单，就是**禁用了 ADL 的“仿函数实体”**。它和 CPO 的区别在于，C++ 标准没有规定 niebloid 必须是函数对象（即也允许通过非标准的编译器扩展实现）。和 CPO 相同，niebloid 也是让约束版本算法更好工作，但出发点纯粹地就是禁用 ADL。考虑如下代码：

```CPP
#include <algorithm>
#include <vector>
using std::ranges;

int main() {
    std::vector<int> a(5), b(5);
    copy(a.begin(), a.end(), b.begin());
}
```

稀松平常，是吗？但问题出在这里的 `copy` 到底是约束版本的 `std::ranges::copy`，还是传统版本的 `std::copy`。有读者可能疑惑，这里用的是 `using namespace std::ranges`，`std` 命名空间里的东西应该看不见的，不可能调用 `std::copy`。但事实是，`a.begin()` 是 `std::vector<int>::iterator` 类型的。在某种实现下，它可能是类似 `std::__gnu_cxx_normal_iterator` 这种 `std` 命名空间下的类型。麻烦了，ADL 出现：`std` 命名空间下的所有函数都纳入查找，`std::copy` 意外地参与重载解析。

更糟糕的是，重载解析时 `std::copy` 一般比 `std::ranges::copy` 更好。如果此时重载解析的结果是 `std::copy`，那就和我们的意图大相径庭了。因此在使用 `std::ranges::copy` 时，必须要禁用 ADL。标准规定：诸如 `std::ranges::copy` 的一系列算法，都应当实现为 niebloid，不允许 ADL。
