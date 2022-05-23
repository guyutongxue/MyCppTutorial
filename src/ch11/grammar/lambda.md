# Lambda 表达式

之前的代码中，我为了用不同方式使用 `sum`，定义了额外的若干个函数 `identity` `square` 和 `square_inv`。然而，定义额外的函数显得啰嗦和麻烦，而且“污染”了全局的命名空间。如果这些函数仅仅使用一次的话，我们可以使用更方便灵活的 **Lambda 表达式**来代替。

Lambda 表达式可以理解为函数类型的字面量。我首先介绍最简单形式的 Lambda 表达式：
```sdsc
[] <opt-block>(<i>参数列表</i>)</opt-block> <opt-block>-><i>返回值类型</i></opt-block> *函数体*
```

比如：
```cpp
[](int a) -> double { return a * a; }
```

就是一个简单的 Lambda 表达式。它的含义就是一个**匿名的、临时的函数**。在需要函数的场合，可以直接使用 Lambda 表达式代替：

```CPP
#include <iostream>
using namespace std;

// 上一节中的 sum，需要传入一个函数（指针）
double sum(int a, int b, double (*term)(int)) {
    return a > b ? 0.0 : term(a) + sum(a + 1, b, term);
}

int main() {
    // 计算 1 + 2 + ... + 5
    cout << sum(1, 5, [](int a) -> double { return a; }) << endl;
    // 计算 3^2 + 4^2 + 5^2
    cout << sum(3, 5, [](int a) -> double { return a * a; }) << endl;
    // 计算 1/(1^2) + ... + 1/(100^2)
    cout << sum(1, 100, [](int a) -> double { return 1.0 / (a * a); }) << endl;
}
```

稍微展开一点原理的话，这种简单的 Lambda 表达式可以隐式转换到一个函数指针。换句话说，上面例子中出现的三个 Lambda 表达式都可以转换成 `double (*)(int)` 类型的指针，指向一个匿名的函数实现。从而，`sum` 调用这样的实参，完成本来的功能。

在这种简单的 Lambda 表达式中，它的表现行为和全局函数类似。Lambda 表达式的函数体中可以访问全局变量，但不能访问局部变量：因为全局函数并不能访问 main 函数中的局部变量。若要对局部变量进行访问甚至修改，则需要用到下一节的捕获语法，这里暂且不表。

## 返回值类型自动推导

C++11 引入 Lambda 的同时，提供了返回值类型自动推导的功能。细心的读者可能注意到我在 Lambda 表达式的语法说明中指出 `@-> *返回值类型*@` 是可选的，也就意味着：可以不提供返回值类型说明，此时编译器从 return 语句的表达式推导返回值类型是什么。

比如：
```cpp
[](int a, int b) { return a + b; }
```
这个 Lambda 表达式中没有给出返回值类型，但由于 `a` `b` 都是 `int` 类型的，所以 `a + b` 也是 `int` 类型的，且它出现在 return 语句中，所以整个 Lambda 表达式的返回值类型就推导为 `int`。类似地：

```cpp
[](int a, int b) { return a < b; }
```

中，`a < b` 这个表达式的类型是 `bool`，所以整个 Lambda 表达式的返回值类型就是 `bool`，不需要我们显式地给出 `-> bool` 的说明。如果没有 return 语句或 return 语句不带表达式，则推导为返回 `void`。

这种“从表达式推导类型”的用法和我在第八章提到的 `auto` [占位类型说明符](/ch08/stl_containers/iterator_concept.md#idx_占位类型说明符)是相似的（其内部运作方法也是相同的）。所以在 C++14 中，返回值类型推导可以用于普通的函数，只需用 auto 来表示返回值类型即可：

```cpp
// 推导为 int add(int a, int b);
auto add(int a, int b) {
    return a + b;
}
```

当然，这需要给出函数的完整定义，而且每条 return 语句的表达式类型需要一致才可以。下面是一个错误示范：

```cpp
// 编译错误：无法推导一致的返回值类型
auto divide(int a, int b) {
    if (b == 0) {
        return 0; // 推导为返回 int
    } else {
        return 1.0 * a / b; // 推导为返回 double
    }
}
```

这种推导在某些时候很有用：比如有些情形中，返回值类型的名字是不知道的；或者这个名字暂时还不能使用。那么这时不如直接用 `auto` 推导一下，编译就能顺利通过。

## 局部定义的“函数”

有的时候，在某个函数内经常出现大段重复的代码，那么这时就可以使用 Lambda 表达式。下面的例子中，我想输出一些字符串，但是要用引号引起它们：

```cpp
void printSomeMsg() {
    std::cout << "\"" << "Lorem" << "\"" << std::endl;
    std::cout << "\"" << "Ipsum" << "\"" << std::endl;
    std::cout << "\"" << "Dolar" << "\"" << std::endl;
    // [...]
}
```
为了减少重复代码，我希望将“输出引号引起的一句话”抽象为一个函数。但我又不想“污染”全局命名空间，因此我可以定义一个局部的 Lambda 表达式：

```cpp
void printSomeMsg() {
    /* ??? */ print = [](const std::string& s) {
        std::cout << "\"" << s << "\"" << std::endl;
    };
    print("Lorem");
    print("Ipsum");
    print("Dolar");
    // [...]
}
```

> 我这里在本书首次使用了复制初始化器而非大括号初始化器。因为对于类似 Lambda 表达式这种长长的初始化值，大括号初始化器的可读性远低于复制初始化器。

之前提到过，Lambda 表达式可以转换为函数指针，所以刚才代码中的 `???` 可以写成一个函数指针类型：
```cpp
void (*print)(const std::string& s) = [](const std::string& s) {
    // [...]
}
```

但这样很麻烦；此时可以直接用 `auto` 占位类型说明符:
```CPP
#include <iostream>
#include <string>
void printSomeMsg() {
    auto print = [](const std::string& s) {
        std::cout << "\"" << s << "\"" << std::endl;
    };
    print("Lorem");
    print("Ipsum");
    print("Dolar");
    // [...]
}
int main() {
    printSomeMsg();
}
```

> 这里 `auto` 推导得到的并不是 `void(*)(const std::string&)` 类型，而是 Lambda 表达式本身的类型（它和函数指针类型之间需要一次隐式转换）。Lambda 表达式本身的类型会在下一节展开讲解。

