# 语法进阶 <Badge type="tip" text="选读" />

介绍完 STL 算法后，我在这里再补充一些更深层次的语法知识。它们和函数式编程关系不大，但有助于写出更高质量的函数式代码。

这一部分目前的内容包括：
- 预置比较：为自定义的类型定义比较运算符，以更好地应用于基于比较的 STL 算法；
- ADL 与 `std::swap` 二段式；https://quuxplusone.github.io/blog/2020/07/11/the-std-swap-two-step/
- 可调用实体与 `std::invoke`；
