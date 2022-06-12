# 类模板

类似地，类模板是能够生成类的语法。换而言之，一个类模板可以提供一簇类。

类模板拥有这样的语法：
```sdsc
"template<"模板形参列表">"
（允许出现模板形参的）类定义
```

> 上语法中 `@类定义@` 可以为类声明（前置声明），但使用前需要显式实例化，否则在使用处编译错误。这里为了简便，使用类定义作为语法说明。（函数模板可为声明的原因是，函数定义的寻找是在链接时（编译后）发生的，而类定义的寻找是在编译期间发生的。）

比如：

```cpp codemo(show)
template<typename T>
class Vla {
    unsigned size;
    T* ptr;

public:
    Vla(unsigned size) : size{size} {
        ptr = new T[size];
    }
    T& operator[](unsigned i) {
        return ptr[i];
    } // 略去 const T& operator[](unsigned) const 重载
    ~Vla() {
        delete[] ptr;
    }
};

int main() {
    Vla<int> a(3);
    a[0] = 3, a[1] = 4, a[2] = 5;
    Vla<char> b(5);
    b[0] = 'a', b[1] = 'b', b[2] = 'c';
}
```

这里定义了类模板 `Vla`。`Vla` 模板可以生成一系列类的定义。与函数模板类似，从类模板生成类的过程仍然称为模板的实例化。

一般而言，使用类模板需要通过 `@模板名"<"模板实参列表">"@` 这样一种指明模板实参的形式。这个形式可以让编译器进行模板的实例化过程生成一个类，且最后生成出得这个类就是这个形式的含义。比如上例 main 函数中的 `Vla<int>` 和 `Vla<char>` 就是模板 `Vla` 实例化的结果。同时，main 函数中的对象 `a` 具有 `Vla<int>` 类型，对象 `b` 具有 `Vla<char>` 类型。

和函数模板非常类似，类模板的实例化过程也是替换。如 `Vla<int>` 类的实例化过程只是把模板类定义中出现的模板形参 `T` 换成模板实参 `int`，换句话说就是生成了这样一个类：

```cpp
class /* Vla<int> */ {
    unsigned size;
    int* ptr;

public:
    Vla(unsigned size) : size{size} {
        ptr = new int[size];
    }
    int& operator[](unsigned i) {
        return ptr[i];
    }
    ~Vla() {
        delete[] ptr;
    }
};
```

在某些情形下，类的实例化可以略去模板实参，利用类模板实参推导（Class Template Argument Deduction, CTAD）机制来完成实例化。

```cpp codemo(show)
template<typename T>
class C {
    T mem;

public:
    C(T mem) : mem{mem} { }
}；

int main() {
    C a(3); // 无需模板实参，推导出应生成 C<int> 类
}
```

但 CTAD 机制需要一个非常“巧”的构造函数才能实现，有时还需要自己写一个称为[推导指引](https://zh.cppreference.com/w/cpp/language/class_template_argument_deduction)的小段代码才能完成。我们并不在这里过多介绍它。
