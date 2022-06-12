# 迭代器的用途

## 遍历

我们介绍了迭代器之后，便不停地在用迭代器来逐个访问容器中的元素。这种遍历的代码非常常见，以至于 C++ 提供了一种新语法来做这件事情：基于范围的 for 循环，简称范围 for。

范围 for 拥有这样的语法：
```sdsc
"for ("变量声明 ":" 容器")"
    语句
```

例如：
````cpp codemo(show)
#include <iostream>
#include <vector>
int main() {
    std::vector a{1, 2, 3};
    for (int i : a) {
        std::cout << i << " ";
    }
}
```

我觉得这段代码不用做太多说明也应该能明白。在循环中引入了变量 `i`，每一次执行循环体时，`i` 都等于 `a` 中一个元素的值，像这样最终把 `a` 中所有的元素依次输出出来。这段代码看上去和我们的主题——迭代器——没有关系啊？其实不然，每一个范围 for 循环都会按照类似下面的模式展开为普通的 for 语句：
```sdsc
"{"
    "auto begin{"容器".begin()};"
    "auto end{"容器".end()};"
    "for (; begin != end; ++begin) {"
        变量声明 "{*begin};"
        语句
    "}"
"}"
```
看上去有点抽象，我们把刚才遍历 `std::vector` 的代码按照这个模式展开一下：
````cpp codemo(show)
#include <iostream>
#include <vector>
int main() {
    std::vector a{1, 2, 3};
    auto begin{a.begin()};
    auto end{a.end()};
    for (; begin != end; begin++) {
        int i{*begin};
        std::cout << i << " ";
    }
}
```
也就是说，每次使用范围 for 循环时，编译器都会自动将这种语法翻译为运用迭代器的一段普通的 for 语句，如同刚才代码所展现的那样。

在更多的情况下，我们可能需要更改容器 `a` 的元素。这时，你需要将 `@变量声明@` 改为声明引用的形式。想一想，为什么？

````cpp codemo(show)
#include <iostream>
#include <vector>
int main() {
    std::vector a{1, 2, 3};
    for (int& i : a) { // 引用声明...
        i *= 2; // 可以修改 a 的元素
    }
    // 现在 a 是 {2, 4, 6}
}
```

`@容器@` 可以是一个数组。这时，编译器展开范围 for 的规则略有改变，`@容器".begin()"@` 改为 `@容器@`，而 `@容器".end()"@` 改为 `@容器 "+ N"@`，其中 `N` 是数组的大小。

## 增删

我们之前提到过，`std::vector` 可以方便地在尾部进行增删，在头部和中间增删需要用到迭代器。这是因为，所有 STL 容器的增删成员函数都是以这样的形式提供的：
```cpp
iterator insert(const_iterator pos, const T& value);
iterator erase(const_iterator pos);
```

（注：`const_iterator` 也是迭代器，但它是指向只读版本的，类似 `const T*` 类型的指针。提供从 `iterator` 到 `const_iterator` 的隐式转换。）

当需要在中间插入元素时，需要指明其插入的位置。而这个位置参数是通过迭代器参数 `pos` 来确定的。如果 `pos` 指向了第 n 个元素，那么调用 `insert` 成员函数之后，就会将 `value` 这个值插入在第 n 个元素**之前**。`insert` 的返回值是指向刚刚插入的元素的迭代器，没啥用。
```cpp
#include <vector>
int main() {
    std::vector a{2, 3};
    // 在首个元素 2 之前插入 1
    a.insert(a.begin(), 1);
    // 现在 a 是 {1, 2, 3}

    // 在中间插入
    auto secondIt{a.begin() + 2};
    a.insert(secondIt, 5);
    // 现在 a 是 {1, 2, 5, 3}
}
```

删除元素则相对简单一点，提供的参数 `pos` 是指向要被删除的元素的迭代器。它的返回值是指向被删除元素的下一元素的迭代器，也没啥用。
````cpp codemo(show)
#include <vector>
int main() {
    std::vector a{1, 2, 3};
    a.erase(a.begin()); // 删除第一个元素
    // 现在 a 是 {2, 3}
}
```

以 `end()` 为参数插入元素和调用 `push_back` 效果相同，而以 `end()` 为参数删除元素则导致未定义行为。

当插入或删除元素时，整个容器的构造可能发生改变；此时，原先的迭代器可能不再适用，变成了类似“野指针”一样的“野迭代器”。而范围 for 中用到的迭代器都是循环之前得到的，如果之后发生了增删则会导致它们不再合法：这告诫我们**不要在范围 for 中增删元素**。

> 由于单向链表 `std::forward_list` 无法做到在某个位置之前插入节点，所以它以 `insert_after` 成员函数代替了 `insert` 成员函数，其效果是在某个位置之后插入元素。
