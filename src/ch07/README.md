# 第七章 继承与多态

面向对象的思想是将现实世界中的概念抽象为“类”，而把复合这些概念的东西抽象为“对象”。前两章我们花费了很大的力气来搞清楚 C++ 是怎么抽象单个对象的，而这一章的“继承”和“多态”则是处理多个对象之间的关系。

## 多个对象之间的关系

现实生活中，任何两个对象之间都可能存在各种各样的关系。而在这里，我们主要谈论这几种关系：
- 是（is-a）
- 有（has-a）
- 使用 (uses-a)
- 依赖于（depends-a）
- 部分于（part-of）

比如：
- 正方形**是**平面图形；
- 小汽车**有**轮子；
- 程序员**使用**键盘；
- 花**依赖于**蜜蜂传粉；
- 大脑是人体的**一部分**。

我们先花上一些时间处理“部分于“有”“使用””这三种关系；它们无需过多的新知识即可在 C++ 中写出来。而“是”这种关系就是继承和多态的内容了。