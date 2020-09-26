# 第五章 初探面向对象

在第三章，我们了解了过程式编程的相关知识。过程式编程将解决问题的思路化作一个一个的过程，而这些过程通过 C++ 中的函数来体现。因此，写出来的程序体现为一个又一个函数的定义，以及它们之间相互的调用。

然而实践表明，这样的编程范式并不是足够完美的。当开发一个软件时，这个软件可能随着需求的变动而发生大量的增删。此时，过程式编程需要不断地增加、删除、修改每一个函数的定义，有时还会调整它们之间的调用关系。这一步已经让一些开发人员比较头疼了。更难受的是，这些函数可能会使用一些存储的数据，然而这些数据它要么是通过指针操作，要么是全局变量；当这些数据暴露给全体函数时，则会让维护数据的工作变得更加艰辛——你需要小心地提防数据如何修改、在哪里修改，才能不影响整个程序的正常运转。

因此上个世纪提出了一种全新的编程范式，称为**面向对象编程（Object Oriented Programming, OOP）**。面向对象的核心是换一种思路——通过模拟现实世界中的事物——来编写程序。面向对象思想对于初学者来说比较难于理解，所以我尽量通过一些简单的例子来阐述它。

## 一个简单的例子

我现在手头有一些长方形纸片。那么我们可以用一个结构体类型来描述一个长方形：
```cpp
struct Rect {
    unsigned int width;  // 宽 
    unsigned int height; // 高
};
```
好。现在假设有两个长方形纸片 `a` 和 `b` ：
```cpp
Rect a, b;
```
我想知道一件事情：它们的面积分别为多少？当然这个问题可以简单地这样解决：
```cpp
unsigned int sa{a.width * a.height};
unsigned int sb{b.width * b.height};
```
我们之前说过，相似的运算可以通过函数来实现。这样搞：
```cpp
unsigned int getArea(Rect x) {
    return a.width * a.height;
}
int main() {
    unsigned int sa{getArea(a)};
    unsigned int sb{getArea(b)};
}
```

看上去很不错。然后现在需求变动，我需要通过纸片的面密度（俗称“克数”）求出一个长方形纸片的质量（重量）。（很奇怪的需求。）那么只好改成这样：
```cpp
constexpr double DENSITY{1.2};
unsigned int getArea(Rect x); // 定义省略
double getMass(Rect x) {
    return getArea(x) * DENSITY;
}
int main() {
    double ma{getMass(a)};
    double mb{getMass(b)};
}
```

之后可能还会有更多的需求，但我们现在这里停下。我们为了求质量，除了定义结构体 `Rect` 之外，还定义了 `getArea` `getMass` `DENSITY` 这些名字。但它们都是全局的——这意味着，如果需求多了一些“求圆纸片的密度”“求圆纸片的质量”“圆纸片的密度和长方形纸片不一样”这些，那么代码的改动就会变得更加繁琐。那么如何优化呢？

先从求面积开始。我们为了求面积引入了函数 `getArea`，它接受一个 `Rect` 变量作为参数。也就是说，这个函数只跟 `Rect` 类型的结构体有关。因此，我们可以直接把这个函数放在结构体定义里，变成一个“成员”：
```cpp
struct Rect {
    unsigned int width;
    unsigned int height;
    unsigned int area() {
        return width * height;
    }
};
```
我可以这样使用它：
```
Rect a;
unsigned int sa{a.area()};
```
直接通过 `a.area()` 这种调用就求出了 `a` 的面积，而且 `area` 这个名字并不在全局范围内。类似地，我们可以把求质量的函数也“放到成员的位置”上：
```cpp
constexpr double DENSITY{1.2};
struct Rect {
    unsigned int width;
    unsigned int height;
    unsigned int area() {
        return width * height;
    }
    double mass() {
        return DENSITY * area();
    }
};
```
我们回顾刚刚的需求，发现只要求密度，不需要求面积。那么，我可以通过把面积函数 `area` 标记为“私有的”，避免外界调用：
```cpp
constexpr double DENSITY{1.2};
struct Rect {
    unsigned int width;
    unsigned int height;
    double mass() {
        return DENSITY * area();
    }

private: // 以下“成员”是私有的，外界不可访问
    unsigned int area() {
        return width * height;
    }
};

int main() {
    Rect a;
    a.area(); // 错误，area 不许调用
}
```
“私有化成员”这个操作看上去比较费解，为什么非要这样做呢？原因是它可以将“求长方形纸片质量”这个操作的细节隐藏起来。也就是说，外界只知道 `Rect` 里面的 `mass` 函数能够求质量，完全不需要知道这个质量到底是怎么求的。这种操作可以减轻外部代码对内部代码的依赖程度，因此对于需求的变动做起来也会相对更加轻松。

事实上，如果密度 `DENSITY` 是只与长方形有关的话，也可以“放在成员的位置上”——但是这里需要更多的知识才能讲清楚，所以只是展示一下：
```cpp
struct Rect {
    unsigned int width;
    unsigned int height;
    double mass() {
        return DENSITY * area();
    }

private:
    static constexpr const double DENSITY{1.2}; 
    unsigned int area() {
        return width * height;
    }
};
```

面向对象还拥有继承、多态等等特性。它们充分地模拟了现实世界的各种问题，从而让计算机能够更加容易地解决现实问题。