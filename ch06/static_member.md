# 静态成员

接下来这一节又是一个小知识点——静态成员。

假设我们要为 `String` 添加一个“寻找字符”的功能，即寻找字符 `c` 第一次出现在这个字符串的第几位。它的实现是这样的：
```cpp
unsigned String::find(char c) {
    for (unsigned i{0}; i <= len; i++) {
        if (c == str[i]) return i;
    }
    return /* what? */;
}
```
那么现在问题就出现了，如果找不到这样的字符串该返回什么？当然，按照习惯来说，大家喜欢返回 `-1`；但注意到这里的返回值类型是 `unsigned`，直接返回 `-1` 会发生一个隐式类型转换（这会把 `-1` 转换到无符号类型 `unsigned` 的最大值）貌似不太合适——因为这种隐式转换并不美观，而且对用户也不友好。

于是我们的解决办法是定义一个特殊的常量 `npos` 来表示找不到这样的值。

```cpp
constexpr unsigned npos{4294967295}; // unsigned 类型最大值
unsigned String::find(char c) {
    for (unsigned i{0}; i <= len; i++) {
        if (c == str[i]) return i;
    }
    return npos;
}
```

但是这样又在全局定义域里多引入了一个名字。为了解决这个问题，静态成员（Static member）就派上用场了。形象地讲，静态成员就是**将类当做[命名空间](ch03/review_cpp.md#命名空间)来用**。我们需要做的是把 `npos` 放到 `String` 的定义里面，但加上 `static` 关键字修饰（以区分普通成员）：
```cpp
class String {
private:
    unsigned len;
public:
    static constexpr unsigned npos{4294967295};

    char* str;
    String();
    // [...] 其余成员函数声明
};
```
然后在使用的时候，就像命名空间一样使用静态成员：
```cpp
#include <iostream>
int main() {
    String a("Hello");
    // String::npos 指明 npos 是“命名空间” String 的名字
    if (a.find('a') == String::npos) {
        std::cout << "string doesn't contain char a" << std::endl;
    }
}
```
所以说，所谓的静态成员跟咱们一般说的非静态成员完全没有关系——我觉得甚至不能叫做“成员”。静态成员只是说这个变量或者函数没有定义在全局作用域，而是放在了一个“里层”的作用域里面防止名字冲突。当我们要访问这个名字的时候，需要加上 `@*类名*::@` 才可以。所以抛开作用域不同这一点之外，它与全局变量、函数没有区别。所以它们都拥有[静态存储期](ch04/list/storage_duration.md#静态存储期)。有人说，静态成员是“所有该类对象共有的成员”，我个人并不喜欢这种说法：因为静态成员跟这个类的对象毫无关系。

静态成员也可以是函数。
```CPP
#include <iostream>
struct A {
    static void f() { // 静态成员函数，用 static 修饰
        std::cout << "Hello" << std::endl;
    }
    static void g();  // 你也可以把定义放在类外
};
void A::g() { }       // 类外定义需要加上 类名::，但不写 static
int main() {
    A::f();           // 如同带有命名空间一样调用
}
```

显然，静态成员函数和普通的非成员函数没有区别。它没有 `this` 指针，不能访问非静态的成员，更不能带有整体 `const` 限定。

不过需要注意的就是，静态成员变量在使用的时候有一些很奇怪的特性。请容许我稍微多费一些口舌：
1. 静态成员变量**默认是声明**而非定义；
2. 静态成员变量**默认是非内联的**；
3. 非内联且非只读的静态成员变量**不允许类内定义**；
4. 只读成员变量一般允许类内定义。

我将这些奇怪的特性总结为以上四条规则。让我们一个个来看：

第一条，静态成员默认总是声明而非定义。
```CPP
struct A {
    static int a; // 这是声明，不是定义！
};
int main() { 
    A::a = 42;    // 错误：A::a 未定义
}
```
上面这段代码，看上去没什么问题，但实际上会报一个未定义错误。这是因为，当写下不带初始化器的静态成员声明时，编译器并不会把它当成一个完整的定义，而是当做一个声明（就类似 `void f();` 这样）。这时如果使用了这个变量就会导致未定义错误。那么解决的办法就是写一个定义了：
```CPP
struct A {
    static int a; // 是声明，不是定义
};
int A::a{0};      // 我们要在类外定义它（不带 static）
int main() { 
    A::a = 42;    // OK 了
}
```

为什么这里要在类外定义它而不是直接在类内加上初始化器呢？这时因为后两条规则在作祟：第二条规则说静态成员变量默认是 *非内联* 的，而 *非内联* 非只读的静态成员又不允许在类内定义它。所以：
```cpp
struct A {
    static int a{0}; // 错误：非内联非只读的静态成员不能定义
};
```
会导致编译错误。这很奇怪，我也很无奈。那么如果我们非要类内定义怎么办呢？那么就不要让它 *非内联*，变成 *内联* 的就好了。这个过程也很简单，只需加上 `inline` 关键字修饰就可以：
```CPP
struct A {
    static inline int a{0}; // 可以类内定义了
};
int main() { 
    A::a = 42; // OK
}
```

而第四条规则说，只读成员大多是容许类内定义的；所以最初我们的 `String::npos` 可以直接在类内加上初始化器。

上面的讨论并不是全面的，但对于一般的使用来说足够了。如果你希望更详细的讨论，可以看下面的表格。

<div class="table-wrapper">
<table>
<thead>
    <tr>
        <th>静态成员变量只读性</th>
        <th>内联性</th>
        <th>可以类内定义？</th>
        <th>可以类外定义？</th>
    </tr>
</thead>
<tbody>
    <tr>
        <td rowspan="2">非只读</td>
        <td>默认为非内联的</td>
        <td>否</td><td>是</td>
    </tr>
    <tr>
        <td>可用 <code>inline</code> 修饰为内联的</td>
        <td>是</td><td>是</td>
    </tr>
    <tr>
        <td rowspan="2"><code>const</code>限定</td>
        <td>默认为非内联的</td>
        <td>是<sup>※</sup></td><td>是</td>
    </tr>
    <tr>
        <td>可用 <code>inline</code> 修饰为内联的</td>
        <td>是</td><td>是</td>
    </tr>
    <tr>
        <td><code>constexpr</code>限定</td>
        <td>默认（且必然）为内联的</td>
        <td>是</td><td>否</td>
    </tr>
</tbody>
</table>
</div>
<p class="small">※ 对于 const 非内联静态成员数据，若要取地址或者绑定引用于其上（正式地，称为 ODR-使用），则必须存在一个类外定义。</p>