# 模板中的友元

假设类模板 `C` 需要有一个友元函数 `f`。你可能打算这样写：

```cpp
template<typename T>
class C {
private:
    T mem;
public:
    friend void f(C<T>& c);
};

template<typename T>
void f(C<T>& c) {
    c.mem += 1;
}

int main() {
    C<int> c;
    f(c);
}
```

解释一下：类模板 `C` 中有一个私有成员 `mem`，我想通过 `f` 这个函数来修改它。所以设置 `f` 为 `C` 的友元。第 6 行的代码做了这件事情。然后，main 函数尝试去用 `f` 来修改`C` 类型的对象 `c`。看上去很美好，但它非常离奇地给出了链接错误：
```
ld: ...main.o:...main.cpp:16: undefined reference to `f(C<int>&)'
```
它的意思是 `void f(C<int>& c);` 这个函数的定义没有找到。为什么呢？明明第 9 行到 12 行就是这个定义啊？不过我们细致地进一步分析一下，就知道问题的所在了。

首先，这里 `C` 和 `f` 都是模板。所以如果不实例化这些模板，那么就不存在对应的函数或类的定义。然后，main 函数中使用了 `C<int>`，所以以实参 `int` 实例化模板 `C`，得到这样的实例化结果：
```cpp
class /* C<int> */ {
private:
    int mem;
public:
    friend void f(C<int>& c);
};
```

也就是说，`C<int>` 期望一个友元函数 `void f(C<int>& c);`。然后，main 函数调用 `f(c)`。注意，这里 `c` 已经是 `C<int>` 类型的，而它拥有一个名字叫 `f` 的友元，所以编译器知道将来某个地方（可能是稍后，可能是其它的翻译单元）存在一个 `void f(C<int>& c);` 这样的函数的定义。**当一个普通函数和函数模板同名时，编译器总是选择普通函数**。所以，这里并不会把 `f` 当成第 9 行的函数模板来调用，而是 `void f(C<int>& c);` 这个普通函数——毕竟 `C` 中友元声明了这样一个函数嘛。

> 像这样，将友元函数纳入函数调用考虑范围的做法称为实参依赖查找（Argument dependent Lookup, ADL）。

然而，直到最后链接阶段也没能发现 `void f(C<int>& c);` 这个函数的定义。最后，链接错误就出现了。你会发现，整个过程中，我们手写的**函数模板 `f` 始终没有被实例化**。这就是问题的根源。

那么怎么办呢？关于这个问题，可以有许多种办法来解决。最简单的一种，是将友元函数定义放在类中。
```cpp codemo(show)
template<typename T>
class C {
private:
    T mem;
public:
    friend void f(C<T>& c) {
        c.mem +=1;
    }
};

int main() {
    C<int> c;
    f(c);
}
```

这时，编译器在找到 `void f(C<int>& c);` 这个函数的声明也同时找到了它的定义。于是，链接通过。尽管我在第六章中反对类内定义友元函数（这是出于防止混淆成员函数与全局函数的考虑），但在类模板的语境下，这反而是最佳的解决方案。

第二种办法是声明友元模板。（注意，友元模板和友元函数、友元类是并列的关系。友元模板不是“生成友元的模板”的意思。）友元模板使得一个模板生成的所有实例都成为其友元。具体的写法是这样的：
```cpp codemo(show)
template<typename T>
class C {
private:
    T mem;
public:
    template<typename U>
    friend void f(C<U>& c);
};

template<typename U>
void f(C<U>& c) {
    c.mem += 1;
}

int main() {
    C<int> c;
    f(c);
}
```

`template<typename U> friend void f(C<U>& c);` 就是友元模板。这里，它的意思是：模板 `template<typename U> void f(C<U>& c);` 这个模板的每一个实例都是 `C<T>` 的朋友。

当这样做时， `f(c)` 中为编译器所考虑的友元将是模板 `template<typename U> void f(C<U>& c)` 的一个实例化结果。为了实例化它，编译器找到了它在第 10 行的定义。于是，实例化得以进行，然后一切就顺利完成了。

最后一种常见的解决办法是声明一个 `f` 模板的 `T` 特化作为其友元。这其实是最符合语义的一种写法，但因为我们没有讲什么叫模板的“特化”，所以这里只是科普一下不必深究。总的来说，最初的类内定义友元的方法仍然是最推荐的写法。

```cpp codemo(show)
template<typename T>
class C;

// 由于 C 中用到了 f 模板，所以必须提前声明 f
// 但 f 声明中又用到了 C，所以还需要前置声明 C
template<typename T>
void f(C<T>& c);

template<typename T>
class C {
private:
    T mem;
public:
    // 声明模板 f 中只有 f<T> 是 C<T> 的友元
    // 编译器会去为此去实例化 f<T>
    friend void f<T>(C<T>& c);
};

template<typename T>
void f(C<T>& c) {
    c.mem += 1;
}

int main() {
    C<int> c;
    f(c);
}
```
