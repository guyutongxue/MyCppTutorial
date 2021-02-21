# 关于派生类成员名

这一节我们稍微停顿，“科普”一下在类的继承关系中，成员名的一些琐碎杂事。

## 成员名重复

```cpp
class Base {
public:
    int a;
};
class Derived {
public:
    int a;
};
```