# 其它顺序容器

`std::vector` 有一个特点：就是它元素的顺序是可以控制的。比如原来它的元素是 `{4, 5, 6}`，那么在尾部插入一个元素 `3` 之后就变成了 `{4, 5, 6, 3}`，前面的三个元素顺序不变。假设我删除了 `5` 这个元素，则变为 `{4, 6, 3}` 仍然保持相对顺序不动。像这样，能够容纳多个元素且元素之间的顺序总是可控制的对象称为**顺序容器**。

除了 `std::vector`，C++ STL 还提供了一些顺序容器。本节将简要地概括它们。

## `std::deque`

`std::deque` 和 `std::vector` 非常像，也是一个长度可变的数组。但它比 `std::vector` 多提供了两个成员函数——`push_front` 和 `pop_front`，也就是从头部插入或删除元素。举例如下：

```CPP
#include <iostream>
#include <deque> // std::deque 定义于 <deque> 头文件

int main() {
    std::deque<int> a{1, 2, 3}; // 实参 <int> 可省略
    a.push_back(4);  // 现在 a 是 {1, 2, 3, 4}
    a.pop_front();   // 现在 a 是 {2, 3, 4}
    a.pop_back();    // 现在 a 是 {2, 3}
    a.push_front(5); // 现在 a 是 {5, 2, 3}
    for (int i{0}; i < a.size(); i++) {
        std::cout << a[i] << " "; // 遍历 std::deque
    }
}
```

STL 拥有这样的特性：成员函数所需的开销都不会太大。这也就意味着，`std::deque` 的 `push_front` 和 `pop_front` 并没有太多的时间开销。确实如此，`std::deque` 在头部增删和在尾部增删都不需要太多时间。（相比之下，`std::vector` 在尾部增删很快，但头部增删就有些慢。所以 `std::vector` 没有提供在头部增删的成员函数。）

但凡事都是有代价的，`std::deque` 虽然提供了更方便的增删操作，但它不保证元素在内存中都是连续存放着的。这也意味着，`std::deque` 的元素访问（即 `operator[]`）会稍慢于 `std::vector`。

> `std::deque` 名字源于数据结构“双端队列（Double-Ended QUEue，DEQUE，音 deck）”。（相比较，`std::vector` 的命名非常随意：`std::vector` 并不是数学上向量（物理称矢量，vector）的含义。）

## `std::array`

此外，最简单的顺序容器就是完全模仿数组的 `std::array`。所谓完全模仿数组，就是它和数组拥有一些相同的特点：
- 语义上是若干个相同类型元素的集合；
- 元素个数是不可变的常量；
- 元素的存储总是连续的（和 `std::vector` 一样）；
- 可通过 `operator[]` 访问其元素，且不检查越界；

`std::array` 是一个类模板，接受两个模板参数：第一个是元素类型，第二个是非类型参数——元素个数。请看下例：
```CPP
#include <iostream>
#include <array> // std::array 定义于 <array> 头文件
int main() {
    std::array<int, 5> a{}; // 类似 int a[5]{};
    std::array c{2.7, 3.1}; // 可省略实参，推导为 double, 2
    for (int i{0}; i < 5; i++) {
        std::cout << a[i] << " "; // 遍历 std::array
    }
}
```

但 `std::array` 解决了一些数组的问题：
- 允许赋值；（数组不允许）
- 不会隐式转换到指针；（数组几乎总是发生转换）
- 可以作为函数参数和返回值；（数组作为参数会转换，不能作为返回值）

`std::array` 基本就是长度固定的 `std::vector`。所以它提供了大量和 `std::vector` 相同的成员函数，比如 `size`，`back`，`front` 以及比较运算符重载等。

## `std::forward_list`

我们在[第四章的一节](/ch04/list/README.md)中罕见地介绍了一种数据结构，叫做链表。而 `std::forward_list` 就是 C++ 对链表的实现。

`std::forward_list` 作为类模板接受一个类型模板参数作为其每个节点存放的数据类型。

```cpp
// std::forward_list 定义于 <forward_list>
#include <forward_list>
std::forward_list<int> a;
```

根据链表的形式，很显然我们做不到在很短的时间内访问其中某个元素。比如当访问第 i 个元素时，我需要进行 i 次对“`next`”指针的解地址操作才可以。正如刚才所说的，STL 不会为消耗时间长的操作提供成员函数，因此 `std::forward_list` 没有一个 `operator[]` 来访问其中某一个元素。所以在不讲迭代器的情况下 `std::forward_list` 基本没什么用处……不过不用担心，我们马上就到迭代器章节，此后会详细展开其使用方法。

## `std::list`

`std::list` 也是链表，但它是双向链表。所谓双向链表就是每个节点拥有类似这样的定义：
```cpp
struct Node {
    Node* prev;
    int data;
    Node* next;
};
```

其中，`prev` 指向链表中的上一个节点，而 `next` 和原来一样指向链表中的下一个节点。头结点的 `prev` 和尾节点的 `next` 都为 `nullptr`。最终，这些节点互相链接形成了这样的结构：

<img src="assets/Doubly-linked-list.svg" alt="Doubly Linked List">

`std::list` 的使用和 `std::forward_list` 基本一样，而且用起来更方便。但缺点就是，每个节点所需的容量变得更大了。

以上就是 STL 中提供的五个顺序容器了。接下来，我们就来揭开神秘的“迭代器”的面纱。

> 需要注意的是，在初始化器上，`std::array` 和其它四种的写法看似一样，但实质有很大不同。其它四种顺序容器都是通过调用带 `std::initializer_list` 的构造函数来初始化的，而 `std::array` 则为了保证与原生数组的兼容，采用了聚合初始化。
> 
> 更具体地讲，`std::array` 内只含有一个原生数组类型的 `data` 成员，且不定义任何构造函数。初始化器中的所有初始化值都是提供给 `data` 的。因此，更普遍的 `std::array` 初始化写法应当是 `std::array<int, 3> a{{1, 2, 3}};`：注意双层大括号，里层大括号用来初始化 `data` 成员。然而，C++14 引入了省略多余大括号的语法，从而只用单层大括号也是正确的。
> 
> 然而单层大括号却造成了一个问题，就是使用多维的 `std::array`。假设有 `std::array<std::array<int, 3>, 2>` 这样一个类型，那么你不能用 `{{1, 2, 3}, {4, 5, 6}}` 这种初始化器来初始化。如果这样写，编译器会用 `{1, 2, 3}` 初始化外层 `std::array` 的 `data` 成员，然后给出两个错误：`{4, 5, 6}` 没有其它成员可以初始化，且 `1` 也无法初始化具有 `std::array<int, 3>` 类型的元素。所以为了避免这种错误，你需要在每一层都使用双重大括号，比如 `{{ {{1, 2, 3}}, {{4, 5, 6}} }}`。这也是 `std::array` 最丑陋的地方了吧（而且使用双重大括号时是不能用 CTAD 的）。