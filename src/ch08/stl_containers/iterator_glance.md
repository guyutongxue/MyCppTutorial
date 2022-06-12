# 初识迭代器

考虑数组和指针的关系。由于数组在内存中总是连续存放它的元素，而指针每次递增都会跨过一个元素的距离。因此，可以通过这样的写法来遍历数组：
```cpp
#include <iostream>
int main() {
    int a[10]{1, 2, 3};
    int* i{nullptr};
    int* begin{a};    // 即 int* i{&a[0]};
    int* end{a + 10}; // 即 int* i{&a[10]};
    for (i = begin; i != end; ++i) {
        std::cout << *i << " ";
    }
}
```

上面的例子中，指针提供了对数组灵活的访问方法。比如指针可以指向数组的起始位置和结束位置（即 `a` 和 `a + 10`），为遍历提供了上下界；指针可以 `++` `--` `+=` `-=` 来改变其所指向的对象；指针可以通过 `==` `!=` 判断其指向位置是否相同；指针可以通过解地址运算符来获取其所指向的内容。

我们希望可以通过同样的方式来遍历 STL 的容器。数组在语法层面可以用指针来访问其中的元素，而 STL 容器则在库层面使用了**迭代器**（Iterator）来做这件事情。

为了简单了解迭代器长什么样，我先笼统地以 `std::vector` 为例，看看如何通过迭代器来像指针一样访问其元素。在 `std::vector` 的类定义中，有一个别名声明。
```cpp
template<typename T, /* ... */>
class vector {
    /* ... */
public:
    using iterator = /* implementation-defined */;
    /* ... */
};
```

这个 `iterator` 别名具体定义的是什么不用管，但它就是我们想要的 `std::vector` 的迭代器的类型。也就是说，`std::vector<T>::iterator` 这个类型就如同 `T[]` 数组类型中的 `T*`。

那么我们先照葫芦画瓢把之前通过指针访问数组的代码改成通过迭代器访问 `std::vector`：
```cpp
#include <iostream>
#include <vector>
int main() {
    std::vector<int> a{1, 2, 3};
    std::vector<int>::iterator i{};
    std::vector<int>::iterator begin{/* ? */};    
    std::vector<int>::iterator end{/* ? */};
    for (i = begin; i != end; ++i) {
        std::cout << *i << " ";
    }
}
```
作为模仿指针的迭代器，`std::vector<T>::iterator` 重载了 `++` `*` 等运算符，并完全模仿了指针在数组中的含义。不过上面两个代码还有两个问号，就是如何获取指向 `std::vector` 头部和尾部的迭代器。很简单，`std::vector` 提供了成员函数 `begin` 和 `end` ，它们分别返回指向首尾的迭代器。最终的代码是这样的：

````cpp codemo(show)
#include <iostream>
#include <vector>
int main() {
    std::vector<int> a{1, 2, 3};
    std::vector<int>::iterator i{};
    std::vector<int>::iterator begin{a.begin()};    
    std::vector<int>::iterator end{a.end()};
    for (i = begin; i != end; ++i) {
        std::cout << *i << " ";
    }
}
```
这份代码就是对迭代器的一个最简单的概括。虽然“迭代器”这个名字很唬人，但它本质上就是在 STL 容器的领域里，模仿了指针在数组中的作用。

但迭代器的复杂性远不止如此。且待后续章节徐徐展开……
