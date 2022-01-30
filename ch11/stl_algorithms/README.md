# STL 算法

STL 分为容器、迭代器和算法三个部分；我在[第八章](ch08/stl_containers)中简单介绍了容器和迭代器。STL 算法的部分，则是包装了在容器上的一些常见操作。

类似迭代器，STL 算法在 C++20 之后进行了一次大的改动。这使得 STL 算法分为两个版本：传统（Legacy）版本和约束（Restrained）版本。传统版本提供了更多的算法，而约束版本则提供了更易用和更快的算法。传统版本的算法定义于 `std` 命名空间，而约束版本的算法定义于 `std::ranges` 命名空间。

```cpp
#include <algorithm>         // STL 算法大多定义于此
using namespace std;         // 若使用传统算法
using namespace std::ranges; // 若使用约束算法
```

为了与时俱进，我决定以讲解约束版本为主要内容。

## 范围（Ranges）

之前在讲什么是迭代器时，用到了这样一张图：

<img src="assets/range-begin-end.svg" alt="begin and end iterator">

这张图除了演示容器的首迭代器和尾迭代器含义外，还表达了这样的意思：如果提供一对迭代器，其中一个作为首，另外一个作为尾；那么**这对迭代器就能表示一系列数据**。
