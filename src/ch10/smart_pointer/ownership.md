# 所有权

终于将移动语义相关的基本语法梳理完了。拥有移动语义后，我们可以开始讨论一个现代的编程概念——所有权（Ownership）。所有权是一个抽象的概念，它不存在于 C++ 标准中，但有助于理解智能指针的工作原理。

首先来介绍一个术语：资源获取即初始化（Resource Acquisition Is Initialization，RAII）。其实这个术语所指代的东西并不复杂，它表示一种惯用的编程手法：即在对象的构造函数中获取所有该对象所需要的资源——包括但不限于**动态存储期（堆上）内存**、文件描述符（含套接字等）、互斥锁或数据库连接等等。此外，必须在析构函数中释放这些资源。这两种手法保证了一个简单的事实：资源存在的时机与对象的生存期一致。另一方面，C++ 保证每个对象的存储都会按照语义正确地获取和释放，因此 RAII 保证每个用到的资源都会正确地释放，避免内存泄漏等安全隐患。

如果一个对象的生存期和其所需要的资源构成 RAII 关系，那么就称这个对象持有该资源的所有权。这种叫法很形象：如果这个对象没了（退出作用域或怎样），那么它所拥有的资源也没了——即所有权中“所有”的含义。反之，如果一个对象所用到的资源跟该对象没有生存期上的耦合关系，那么就说这个对象不持有所有权。

```cpp codemo
struct S {
    int* resource;

    S() {
        resource = new int{42};
    }
    ~S() {
        delete resource;
    }
};
int main() {
    int* ptr{nullptr};
    {
        S s; // s 持有资源 s->resource 的所有权
        ptr = s->resource; // ptr 不持有所有权

    } // 此处 s 消失后资源会释放

    // ptr 仍然可访问，但资源已释放
}
```

## 独占所有权

所有权的管理主要分为两种：独占所有权（Unique ownership）和共享所有权（Shared ownership）。独占所有权就是字面意思：对于某个固定的资源，全世界只有一个对象持有所有权。之前的 `String` 例子中，`String` 类型对象就独占其底层字符数组的所有权。

设计独占所有权的类时可能会遇到一些问题。

```cpp
struct UniquePtr {
    int* ptr;
    UniquePtr(int* ptr) : ptr{ptr} {}

    // 持有所有权的表现：对象被销毁的同时销毁资源
    ~UniquePtr() {
        delete ptr;
    }
};

int main() {
    UniquePtr pa{new int{}};
    UniquePtr pb{pa};
    // 停！此时 pa 和 pb 持有同一对象的所有权
}
```

刚才这样简单的设计会导致复制指针时，两个指针同时持有所有权。当两个指针先后析构时，后析构的那个会重复释放已释放的资源，从而导致运行时错误。这非常不好。

因此设计独占所有权的指针时，需要**禁用复制**。此外，还可以启用移动语义：允许更改资源的持有者，或者说转移所有权。

```cpp codemo
#include <utility>

struct UniquePtr {
    int* ptr;
    UniquePtr() : ptr{nullptr} {}
    UniquePtr(int* ptr) : ptr{ptr} {}

    // 禁用复制
    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    // 但允许移动
    UniquePtr(UniquePtr&& other) : ptr{nullptr} {
        std::swap(ptr, other.ptr);
    }
    UniquePtr& operator=(UniquePtr&& rhs) {
        std::swap(ptr, rhs.ptr);
        return *this;
    }

    ~UniquePtr() {
        // 若持有资源，则析构时销毁
        if (ptr) delete ptr;
    }
};

int main() {
    UniquePtr pa{new int{}};
    // 编译错误：不允许复制构造
    // UniquePtr pb{pa};

    // OK，将 pa 所持有的资源移交给 pb
    UniquePtr pb{std::move(pa)};

    // 现在 pa 不持有资源
    // pb 析构时，将资源释放
}
```

> 或许你可以将复制构造/复制赋值重载定义为复制资源，但并不是所有资源都可以复制（如文件操作、网络接口等）；而且赋值时复制资源与“裸”指针赋值的语义也不符。“裸”指针复制时并不会复制其所指向的内容，那自定义的类型就不应该这样做。

这个实现保证每个 `UniquePtr` 能独一无二地持有其所使用的资源，并且会自动释放它。这种自动释放的指针看上去非常智能，因此这类指针被称为智能指针（Smart pointer）。标准库的 `std::unique_ptr` 实现了独占所有权的智能指针。

```cpp codemo
#include <memory> // 智能指针定义于此

int main() {
    std::unique_ptr<int> pa{new int{42}};
    // 禁止复制
    // std::unique_ptr<int> pb{pa};

    // 转移所有权
    std::unique_ptr<int> pb;
    pb = std::move(pa);
}
```

像这样使用智能指针时，会出现“游离”的 new 运算符。这样写不太美观：因为这个 new 对应的 delete 已经交给智能指针负责了，显式的 new 可能带来错误的“手动内存管理”的错觉。因此标准库提供了 `std::make_unique` 辅助函数，它会使用 new 运算符获取自动存储期对象，并用调用时的实参初始化该对象，最后返回持有该对象所有权的 `std::unique_ptr`。刚刚的例子可以改进成这个样子：

```cpp codemo
#include <memory> // 智能指针定义于此

int main() {
    std::unique_ptr pa = std::make_unique<int>(42);

    // 转移所有权
    std::unique_ptr<int> pb;
    pb = std::move(pa);
}
```

`std::unique_ptr` 支持 `new[]` 类似的变长数组分配。在这种形式下，你需要将“未知长度数组”作为 `std::unique_ptr` 或 `std::make_unique` 的模板实参。此外，动态的“数组长度”作为 `std::make_unique` 的函数实参传入：

```cpp codemo
#include <memory> // 智能指针定义于此

int main() {
    int n;
    std::cin >> n;
    // 分配 n 个 int；pa 持有它们的所有权
    std::unique_ptr pa = std::make_unique<int[]>(n);

    // 数组元素被值初始化（零初始化）
    pa[0]; // 0
}
```

这里可以正常使用 `pa[0]`，表明 `std::unique_ptr` 在拥有“数组”类型对象时重载了 `operator[]`。此外，`std::unique_ptr` 重载了 `operator->`，意味着如果它持有一个类类型对象（结构体），则可以直接通过 `->` 访问其成员：

```cpp codemo
#include <memory> // 智能指针定义于此

struct Coord {
    int x, y;
}

int main() {
    std::unique_ptr pa = std::make_unique<Coord>(1, 2);

    pa->x; // 1
    pa->y; // 2
}
```
