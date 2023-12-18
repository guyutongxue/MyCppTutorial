# RTTI

考虑之前的代码：
```cpp
#include <string>
#include <iostream>
struct Animal {
    virtual std::string getName() const {
        return "animal";
    }
};
struct Cat : public Animal {
    std::string getName() const {
        return "cat";
    }
    void meow() const { }
};
struct Dog : public Animal {
    std::string getName() const {
        return "dog";
    }
    void bark() const { }
};
```

我在其中添加了两个成员函数：`Dog` 拥有自己独有的成员函数 `bark`，而 `Cat` 拥有自己独有的成员函数 `meow`。那么，如果我们想要编写这样一个功能：检查一个 `Animal` 是不是 `Dog`，如果是的话就让它 `bark()`，否则什么都不做。那么怎么去实现呢？

最基础的想法是利用之前的 `getName`。
```cpp
void tryBark(const Animal* a) {
    if (a->getName() == "dog") {
        const Dog* dog{static_cast<const Dog*>(a)};
        dog->bark();
    }
}
```

但是这带来一个问题：就是它依赖于这样一个不那么可靠的自定义函数 `getName`。为什么说“不那么可靠”呢？我们必须为每一个 `Animal` 的子类定义一个 `getName` 虚函数的覆盖，并且不同子类的返回值必须不同。（即只有 `Dog` 的 `getName` 会返回 `"dog"`。）那么这个维护成本就很高了。

> 除此之外，还有函数调用的时间和空间开销也是有可能存在的（但一般会被优化）。可以通过将 `getName` 定义为数据成员（只读，并在初始化时指定）而非函数来减少这个调用开销。

<h6 id="idx_RTTI"></h6>
<h6 id="idx_运行时类型识别"></h6>

C++ 提供了一种称为**运行时类型识别**（RunTime Type Identification, RTTI）的机制来简化这类代码。RTTI 提供了两种方法，先从最直观的 typeid 运算符讲起。

## typeid 运算符

typeid 运算符可以用于检查一个指针（或引用）所指向（或绑定到）的对象的“实际”类型。

| 运算符      | 名称          | 作用                     |
| ----------- | ------------- | ------------------------ |
| `typeid(a)` | typeid 运算符 | 获取对象的运行时动态类型 |

直观来看，它的用法是这样的：
```cpp codemo(show)
#include <iostream>
#include <typeinfo>  // 语法规定使用 typeid 运算符必须引入的头文件
struct B {
    virtual ~B() { } // 稍后解释
};
struct D1 : B { };
struct D2 : B { };
int main() {
    B* b{new D1{}};
    if (typeid(*b) == typeid(D1)) {
        std::cout << "b has type D1" << std::endl;
    }
    if (typeid(*b) == typeid(D2)) {
        std::cout << "b has type D2" << std::endl;
    }
    delete b;
}
```

上面的程序中，`typeid(*b) == typeid(D1)` 检测 `*b` 在运行时是否是 `D1` 类型的。具体而言，typeid 运算符由 `typeid` 关键字开头，并拥有如下两种格式：
```sdsc
"typeid("表达式")"
"typeid("类型")"
```

对于相同 `@表达式@` 的类型或相同 `@类型@`，typeid 运算符总是得到相同的值（即 `==` 为真）。特别需要注意的是：它可以得到具有子类型多态的派生类对象的**运行时“实际”类型**。在这个例子中，`typeid(*b)` 与 `typeid(B)` 不等，因为 `*b` 在运行期间并不是 `B` 类型的而是 `D1` 类型的。所以，`typeid(*b) == typeid(D1)`。

可以看到，typeid 运算符不得到编译器常量。如果 `b` 的指向随着用户输入的改变而改变，那么 typeid 运算符也会得到不同的值。基于此，我们可以这样设计刚才的 `tryBark`：

```cpp
void tryBark(const Animal* a) {
    if (typeid(*a) == typeid(Dog)) {
        const Dog* dog{static_cast<const Dog*>(a)};
        dog->bark();
    }
}
```

从而我们不用手动维护之前的 `getName` 成员了。

> typeid 运算符是一元的，它的结果值类型为 `std::typeinfo`，定义在 `<typeinfo>` 头文件中，这也就是为什么语言规定必须引入它。`std::typeinfo` 除了定义了 `operator==` 和 `operator!=`，还定义了成员函数 `name`，通过 `@typeid(*x*).name()@` 即可获取到有关 `@x@` 的类型名。这个类型名是实现定义的，比如可能为*重整名字*（更多资料可参阅[维基百科](https://zh.wikipedia.org/wiki/%E5%90%8D%E5%AD%97%E4%BF%AE%E9%A5%B0)）。
>
> typeid 运算符会忽略顶层只读限定，即 `typeid(const T) == typeid(T)`。

## `dynamic_cast`

RTTI 所引入的第二种编程方法就是 `dynamic_cast`，即上一节中提到的最后一种 C++ 风格转换。

请稍微留意一下刚才 typeid 运算符版本的 `tryBark`。函数首先通过 `typeid` 检查 `a` 的运行时类型，如果是 `Dog` 则通过 `static_cast` 转换到 `Dog` 类型，从而可以调用其 `bark` 语句。现在，`dynamic_cast` 可以将检查类型和类型转换两件事情合二为一。请看下面的代码：
```cpp
void tryBark(const Animal* a) {
    const Dog* dog{dynamic_cast<const Dog*>(a)};
    if (dog != nullptr) { // 也可写作 if (dog) { ... }
        dog->bark();
    }
}
```

正如刚才所述，`dynamic_cast` 做了两件事：
1. 检查 `a` 所指向的“实际”类型是否为 `Dog`；
2. 若是，则得到 `const Dog*` 类型的值，指向这个 `Dog`；否则，得到 `nullptr`。

然后，我们只需判断 `dog` 是否为 `nullptr` 即可。总得来看，`dynamic_cast` 在用法上和 `static_cast` 具有一定相似性：它可以用来做“向下转型”。但不同的是，`dynamic_cast` 会在转型之前做额外的检查：如果 `a` 不能安全地转换到目标类型，则返回 `nullptr`。所以 `dynamic_cast` 不可能得到危险的结果，这也是为什么称它比 `static_cast` 更安全的原因。

值得一提的是，我在第二章 [switch 语句](/ch02/part3/switch_statement.md)的一个注中给出了 if 语句的声明形式——即在条件处引入带初始化器的声明而非表达式来作为判断条件。在这里，我们可以运用这种形式的 if 语句来实现更简洁的写法：
```cpp
void tryBark(const Animal* a) {
    if (const Dog* dog{dynamic_cast<const Dog*>(a)}) {
        dog->bark();
    }
}
```

> 如果将 `dynamic_cast` 用在引用上，则检查失败会抛出异常。（与 `nullptr` 相反，不存在空引用类型。）

## 注意事项

typeid 运算符和 `dynamic_cast` 是 C++ 中 RTTI 的体现方法。它们共同的特点是可以获取一个指针指向的运行时“实际”类型。而获取“实际”类型这个过程并不是容易实现的，它需要保存一些额外信息——多态信息。一般地，这些信息会与虚函数调用相关的一些内部结构相关，所以 **C++ 只允许拥有虚函数的类使用 RTTI**。

> RTTI 的实现原理一般是在虚函数表中增加指向 `std::type_info` 的指针。每个 `std::type_info` 根据继承关系构成有向无环图。 `typeid` 直接获取虚函数表中的这个指针，而 `dynamic_cast` 需要在有向无环图中进行遍历搜索直至成功或失败。所以 `typeid` 的运行时性能与一般多态显著无差别，但 `dynamic_cast` 的**性能消耗较大**。但凡开启了 RTTI，由于需要存储这些 `std::type_info`，编译出的二进制文件也会变大。

拥有虚函数的类及其派生类被称为**多态类型**（Polymorphic type）。多态类型的指针（或引用）会指向（或绑定到）两种意义上的类型：一是它声明时所使用的类型（即上例中的 `Animal`），而是它所“实际”指向的类型（上例中可以理解为 `Dog` 或 `Cat`，取决于运行期间的赋值）。可以看出，前者的类型（`Animal`）在编译期间就可以确定，而后者的类型每一次运行随着用户输入变化可能得到不同的类型。所以，前者被称为**静态类型**（Static type），后者被称为**动态类型**（Dynamic type）。再次重申，静态类型和动态类型只存在于**多态类型**指针（或引用）所指向（或绑定到）类型这一范畴内。

上文在最初引入 typeid 运算符的一个小例子中，我为基类 `B` 添加了一个虚的析构函数 `virtual ~B();`。这使得 `B` 成为了多态类型，从而 `typeid` 才能正常工作。如果删去它，那么 `typeid` 只能获取到“静态类型”，也就没有 RTTI 了。我将在后续章节对虚析构函数做更多的介绍，它除了“迫使”基类成为多态类型外还有更重要的用途。
