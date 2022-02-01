# 实参依赖查找 <sub>选读</sub>

**实参依赖查找（Argument-Dependent Lookup, ADL）**是 C++ 中很恶心的一个语法细节。说实话，它在平常使用中几乎看不见、摸不着；但一旦深入某个标准库函数的实现，或者构建某些库的时候，ADL 就是绕不开的点。所以我在这一节稍稍展开一点，以此抛砖引玉。

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

## CPO

C++20 引入了约束版本的 STL 算法。为了让约束版本的算法更好地工作，C++ 提出了定制点对象（Customized point object，CPO）这一概念。

> 由于一部分定制点对象并不具备字面意义上“可定制”的效果，所以定制点对象不是一个好的术语。我们姑且把 CPO 当成一个莫名其妙的术语名来看待就好。

标准库中

?> \[TODO\]

## niebloid

?> \[TODO\]