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


