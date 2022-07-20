# `std::set`

关联容器（Associative container）是另一种 STL 容器。之前的 STL 容器都是顺序容器——即顺序可控制，而关联容器之间的元素是不可以控制顺序的。你也可以理解为，在关联容器中不存在顺序的概念。

在现实生活中，不需要顺序的场合很多。数学上用集合这个概念来表示那些没有顺序的元素构成的事物。而在 C++ 中，则使用 `std::set` 这个关联容器来代表集合。

`std::set` 是一个类模板，接受一个类型参数代表元素类型。
```cpp
#include <set> // std::set 定义于此
int main() {
    std::set<int> a{1, 2, 3};
}
```

由于关联容器没有顺序，所以向其中插入元素不需要指出位置：
```cpp codemo(show)
#include <set>
int main() {
    std::set a{1, 2, 3};
    a.insert(4); // 向集合中加入元素 4
}
```

那么出现了一个问题：`insert` 成员函数的返回值是什么？呃……比较复杂，它的类型是 `std::pair<iterator, bool>`。我们必须在这里停顿一下，来看看这个返回值到底啥意思。

首先，这个类型是一个叫做 `std::pair` 的类模板并以 `iterator` 和 `bool` 两个类型实参。`std::pair` 其是就是一种很普通的结构体——模板，大体上长成这样：
```cpp
template<typename T, typename U>
struct pair {
    T first;
    U second;
};
```
嗯，就这么简单。它还带一些其它的成员函数，但并不重要。总之，它的存在意义就是把两个类型的变量“绑在一起”。什么时候需要用到 `std::pair` 呢？就是一些只能放一个变量的地方却想要挤进去两个变量的场景。比如函数返回值：函数一般只能返回一个值，但 `insert` 成员函数它特别想要返回两个值。那没办法，只能把这两个变量包到 `std::pair` 里面一起返回了。

好的，现在我们搞清楚 `std::pair` 是个什么了，然后再来看看它包起来的两个变量分别是什么吧。第一个是 `iterator` 类型的变量。它作为一个迭代器，是指向刚刚插入的元素的。这个行为和顺序容器的 `insert` 保持一致。然后第二个是 `bool` 类型的变量，指明插入操作的成功与否。什么叫“插入操作的成功”呢？要知道，数学上的集合是**不允许重复元素**的。`std::set` 模拟了这一行为，如果插入元素时发现了已经存在了，就会取 `false` 作为返回值的第二成员。（同时，第一成员取指向已存在的元素的迭代器。）相反，如果插入成功，那么第二成员就是 `true` 了。下面的代码对此做了演示：
```cpp codemo(show)
#include <iostream>
#include <set>
// 检查 insert 返回值的函数。
// （这个类型说明符真的太长了。如果嫌麻烦的话，可以改成函数模板。）
void check(std::pair<std::set<int>::iterator, bool> r) {
    // r.second 表明插入是否成功
    if (r.second) {
        // r.first 是指向插入元素的迭代器
        std::cout << "insert success " << *(r.first) << std::endl;
    } else {
        std::cout << "insert fail" << std::endl;
    }
}
int main() {
    std::set a{1, 2, 3};
    check(a.insert(1)); // 插入失败
    check(a.insert(4)); // 插入成功
}
```

相比插入，用于删除的 `erase` 成员函数则简单很多。嗯，直接删就行，它返回 `0` 或者 `1` 表明删除了多少个元素。

```cpp
#include <set>
int main() {
    std::set a{1, 2, 3};
    a.erase(2); // 删除 2 这个元素
    // 现在 a 是 {1, 3}
}
```

关联容器还有比较特别的一点：尽管关联容器内的元素没有可控制的顺序，但它查找某个元素的速度非常快。因此，关联容器提供了一个 `find` 成员函数来专门做查找：
```cpp
iterator find(const T& val);
```

`find` 成员函数以要查找的值作为参数，返回一个迭代器。如果查找到这个元素，则返回指向它的迭代器，否则返回 `end()` 迭代器。所以你可以用这个函数来确认一个 `std::set` 是否包含某个元素：

```cpp
#include <set>
#include <iostream>
int main() {
    std::set a{1, 2, 3};
    int x;
    std::cin >> x;
    if (a.find(x) == a.end()) {
        std::cout << x << " isn't in a"<< std::endl;
    } else {
        std::cout << x << " is in a" << std::endl;
    }
}
```

`std::set` 的迭代器是前向迭代器。这也就意味着它的作用并不大。基本上，除了查找和删除外，我们只用它来遍历其中的元素。而遍历则可通过简单的范围 for 来帮我们做，代码跟之前顺序容器的遍历是一样的；但需要注意关联容器没有顺序，所以输出元素的顺序是不可控制的。此外，迭代器总是指向只读版本的元素，也就是不允许通过迭代器来修改元素的值（否则这会破坏整个数据结构）。

```cpp codemo(show)
#include <set>
#include <iostream>
int main() {
    std::set a{1, 2, 3};
    // 要么用 int，要么用 const int&
    // 用 int& 是编译错误：不能修改元素
    for (const int& i : a) {
        std::cout << i << " ";
    }
}
```

`std::set` 还有一个变种是 `std::multiset`。从字面意思上就可看出，它模拟了“多重集”这一数学概念，指集合中同一元素可以多次出现。放开了这个口子之后，`insert` 成员函数也就不那么复杂了。对于 `std::multiset` 来说，它典型的增删成员函数是这样的：
```cpp
iterator insert(const T& val);
unsigned erase(const T& val);

iterator erase(iterator pos);
```

> 准确说第二个成员函数的返回值类型应当是 `size_t`，是模板内部的一个无符号整数类型的别名，一般等于 `std::size_t`。`std::set` 也拥有最后一种形式的 `erase` 重载，但用起来肯定没之前说的那种方便。

第一个 `insert` 成员函数不再返回什么什么 `std::pair`，而是只返回迭代器——因为不可能发生插入失败的情形。而第二个 `erase` 成员函数则从容器中删除所有值为 `val` 的元素，返回值为一共删除了多少个。所以如果只删除其中一个，则需要用到最后一个 `erase` 的重载形式——这个形式接受一个迭代器作为参数。调用它时，程序将把这个迭代器所指向的那个元素删除。一般在使用的时候，会首先调用 `find` 成员函数找到你想要删的元素，然后传进去。

```cpp codemo(show)
#include <set>
int main() {
    // 多重集允许重复元素
    std::multiset a{1, 2, 2, 3};
    // 找到指向其中一个 2 的迭代器
    auto result{a.find(2)};
    if (result != a.end()) {
        // 删除它
        a.erase(result);
    }
    // 现在 a 是 {1, 2, 3}
}
```

科普一个小知识点：if 语句还有一种带初始语句的形式（类似 for 语句的第一个分号一样），所以上面的代码可以进一步简化：
```cpp codemo(show)
#include <set>
int main() {
    std::multiset a{1, 2, 2, 3};
    // 带初始语句的 if
    if (auto result{a.find(2)}; result != a.end()) {
        a.erase(result);
    }
}
```

需要注意的是，`std::map` `std::set` 在插入自定义的结构体时，需要定义该类型的比较运算符（如 `operator<`），我之后会在[预置比较](../../ch11/advanced/defaulted_compare.md)一节中演示如何做。此外，还有两种关联容器 `std::unordered_set` `std::unordered_multiset`；它们的作用和 `std::set` `std::multiset` 几乎一样，不过插入、删除的性能相比要快。但 `unordered` 版本的容器默认只能插入内置类型（如 `int` 等）和标准库类型（如 `std::string` 等），对于自定义的类型则需要额外的工作（实现 `std::hash` 的特化），比较麻烦。
