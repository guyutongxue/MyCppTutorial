# `std::shared_ptr`

`std::shared_ptr` 是具有共享所有权的智能指针。与独占所有权不同，共享所有权指有多个对象持有同一资源的所有权。比如下面的例子中：

```cpp codemo
#include <memory>

int main() {
    std::shared_ptr<int> p = std::make_shared<int>(42);
    std::shared_ptr<int> q = p; // 也可用 auto 占位符声明
    // [...]
}
```

指针 `p` 和 `q` 同时指向保存了值 `42` 的资源。此外，两个指针同时持有这个资源的所有权。当所有权被多个所有者共享时，只有全部所有者都退出作用域时，资源才被释放。或者说，直到最后一个所有者退出作用域时，资源才被释放。

```cpp codemo
#include <memory>

int main() {
    std::shared_ptr<int> p = std::make_shared<int>(42);
    {
        auto q = p; // 此时 p、q 同时持有资源
        // [...]
        // q 退出作用域，但资源仍然有效；因为 p 还活跃
    }
    *p = 56; // OK
    // p 退出作用域，它是唯一一个持有者，资源被释放
}
```

`std::shared_ptr` 使用了名为引用计数的技术来实现共享所有权。每个 `std::shared_ptr` 内持有两个裸指针，第一个指针指向需要管理的资源，第二个指针指向控制块。一般地，控制块内保存一个值，代表当前有多少个所有者持有该资源——即引用数（Reference count）。调用 `std::make_shared` 时，引用数设置为 1。当 `std::shared_ptr` 被复制时，控制块内的引用数 + 1。当 `std::shared_ptr` 析构时，控制块内的引用数 - 1。如果引用数减为 0，就表明没有所有者了，便释放对应资源。

## 循环引用

由于 `std::shared_ptr` 看上去太智能了，所以容易引发一些问题。其中最常见的就是循环引用问题。考虑这样一个场景：每个人（`Person`）都拥有一个同伴，也是一个人。那么按照第七章提到的设计方式，我们应当将同伴作为 `Person` 类的指针成员：

```cpp codemo
#include <string>
#include <memory>
#include <iostream>
class Person {
    std::string name;
    std::shared_ptr<Person> partner;
public:
    Person(const std::string& name) : name{name} {}
};
```

两个人可以结为同伴：

```cpp codemo
#include <string>
#include <memory>
#include <iostream>
class Person {
    std::string name;
    std::shared_ptr<Person> partner;

public:
    Person(const std::string& name) : name{name} {}
    friend void makePartner(std::shared_ptr<Person>, std::shared_ptr<Person>);
};
void makePartner(std::shared_ptr<Person> a, std::shared_ptr<Person> b) {
    a->partner = b;
    b->partner = a;
}
```

然后试一试：

```cpp codemo
#include <string>
#include <memory>
#include <iostream>
class Person {
    std::string name;
    std::shared_ptr<Person> partner;

public:
    Person(const std::string& name) : name{name} {}
    friend void makePartner(std::shared_ptr<Person>, std::shared_ptr<Person>);
};
void makePartner(std::shared_ptr<Person> a, std::shared_ptr<Person> b) {
    a->partner = b;
    b->partner = a;
}
// codemo show
int main() {
    auto alice = std::make_shared<Person>("Alice");
    auto bob = std::make_shared<Person>("Bob");
    makePartner(alice, bob);
    // 看上去挺不错？
}
```

但如果我们在构造函数和析构函数加上输出来观察的话，就会发现……

```cpp codemo
#include <string>
#include <memory>
#include <iostream>
// codemo show
class Person {
    std::string name;
    std::shared_ptr<Person> partner;

public:
    Person(const std::string& name) : name{name} {
        std::cout << "Constructor for " << name << " called" << std::endl;
    }
    ~Person() {
        std::cout << "Destructor for " << name << " called" << std::endl;
    }
    friend void makePartner(std::shared_ptr<Person>, std::shared_ptr<Person>);
};
// codemo hide
void makePartner(std::shared_ptr<Person> a, std::shared_ptr<Person> b) {
    a->partner = b;
    b->partner = a;
}
int main() {
    auto alice = std::make_shared<Person>("Alice");
    auto bob = std::make_shared<Person>("Bob");
    makePartner(alice, bob);
    // 看上去挺不错？
}
```

刚刚的代码根本没有调用析构函数！而这个问题的原因就是循环引用。首先，`std::shared_ptr` 释放资源的前提是，最后一次 `std::shared_ptr` 本身析构后，引用计数降为 0。但仔细观察这份代码：当 Alice 想要析构的时候，Bob 的 `partner` 成员却持有所有权，导致 Alice 的引用计数仍然不为 0。Bob 方面同理，由于 Alice 也持有着 Bob 的所有权，所以 Bob 也不能析构。这样，两者互相牵制对方，析构函数总是无法调用。

那么解决方法呢？最简单的：直接将 `partner` 成员设置为裸指针。裸指针不具有所有权，不会影响 `std::shared_ptr` 的控制块引用计数。但问题是裸指针是潜在危险的：如果这个指针指向的资源已经被 `std::shared_ptr` 自动释放了，那么裸指针就变成了危险的野指针。

为此，标准库提供了 `std::weak_ptr` 来解决循环引用问题。简单来说，`std::weak_ptr` 是**不含所有权**的 `std::shared_ptr`。换而言之，将 `std::shared_ptr` 复制给一个 `std::weak_ptr` 不会增加引用计数。

但 `std::weak_ptr` 不同于 `std::shared_ptr` 的重要之处在于，`std::weak_ptr` 也会保存指向控制块的指针。也就是说，一个 `std::weak_ptr` 可以知道目前其所指向的资源的引用计数。这时，如果引用计数为 0，就意味着资源已经释放。当 `std::weak_ptr` 发现资源已经释放时，就不可以再访问这个资源。

上述限制资源访问的方法是：`std::weak_ptr` 不定义一元 `operator*`、`operator->` 或 `operator[]`，以及任何可以直接访问到指针本身的操作（如 `get` 成员函数）。如果要访问 `std::weak_ptr` 所指向的资源，则必须通过 `lock` 成员函数——该成员函数检查资源可用性后，返回指向资源的 `std::shared_ptr`；否则返回空指针。你只需要保证调用 `lock` 成员函数时处于一个“局部”作用域内，就能保证不会出现循环引用。

使用 `std::weak_ptr` 改写后的代码如下：

```cpp codemo
#include <string>
#include <memory>
#include <iostream>
// codemo show
class Person {
    std::string name;
    std::weak_ptr<Person> partner; // 不持有同伴的所有权

public:
    Person(const std::string& name) : name{name} {
        std::cout << "Constructor for " << name << " called" << std::endl;
    }
    ~Person() {
        std::cout << "Destructor for " << name << " called" << std::endl;
    }
    friend void makePartner(std::shared_ptr<Person>, std::shared_ptr<Person>);

    // 演示 std::weak_ptr 用法：需要时 lock
    void getPartnerName() const {
        if (auto p{partner.lock()}) {
            std::cout << "My partner is " << p->name << std::endl;
        } else {
            std::cout << "No partner, or partner is destructed" << std::endl;
        }
    }
};
void makePartner(std::shared_ptr<Person> a, std::shared_ptr<Person> b) {
    a->partner = b;
    b->partner = a;
}
int main() {
    auto alice = std::make_shared<Person>("Alice");
    {
        auto bob = std::make_shared<Person>("Bob");
        makePartner(alice, bob);
        alice->getPartnerName();
    }
    alice->getPartnerName();
}
```

最后的代码中，我把 Bob 放在了更小的作用域内，这样 Bob 会比 Alice 更早释放。Bob 释放后，试图获取 Alice 的 `partner` 成员就会得到空指针。

> 为了保证所有的 `std::weak_ptr` 在资源释放后还可以继续工作，`std::shared_ptr` 同时需要维护控制块的生存期。简单来说，控制块中除了包含引用计数，还要包含“弱计数”（Weak count），即目前有多少 `std::weak_ptr` 指向这个控制块。只有当弱计数降为 0 的时候，`std::shared_ptr` 或 `std::weak_ptr` 才会释放控制块。
