# RTTI

运行时类型识别（RunTime Type Identification, RTTI）是一种 C++ 机制，可以一定程度上简化代码并保证代码的安全性。

?> 以下为草稿

RTTI 
- `dynamic_cast`
- `typeid`

> RTTI 的实现原理一般是在虚函数表中增加指向 `std::type_info` 的指针。每个 `std::type_info` 根据继承关系构成有向无环图。 `typeid` 直接获取虚函数表中的这个指针，而 `dynamic_cast` 需要在有向无环图中进行遍历搜索直至成功或失败。所以 `typeid` 的运行时性能与一般多态显著无差别，但 `dynamic_cast` 的性能消耗较大。但凡开启了 RTTI，由于需要存储这些 `std::type_info`，编译出的二进制文件也会变大。

