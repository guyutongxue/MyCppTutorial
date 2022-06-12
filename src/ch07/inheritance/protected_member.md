# 保护成员

所谓“保护成员”，就是介于“公开成员”和“私有成员”之间的一种成员。

在类的派生过程当中，“基类的私有成员对派生类不可见”这个设定有的时候很让人头疼。假设某个基类中的成员，派生类中需要对其访问，但它又不方便完全公开；那么就需要用到保护成员了。

保护成员是指访问修饰符为 `protected` 的那些成员。它的访问范围和私有成员基本一致，唯有一个例外：其派生类对象可以访问它。
````cpp codemo(show)
class Base {
private:
    int privateMem;
protected:
    int protectedMem; // 保护成员
public:
    int publicMem;
};
class Derived : public Base {
    void f() {
//      this->privateMem++;   // 私有成员不可访问
        this->protectedMem++; // 但保护成员可访问
    }
};
int main() {
    Derived d;
    // 在类外，保护成员和私有成员访问性质相同
//  d.privateMem++;
//  d.protectedMem++;
    d.publicMem++;
}
```

而且，保护成员仅仅放开了“自己的派生类对象”的访问权限，而没有放开“其它派生类对象”的访问权限。
```cpp
class Base {
protected:
    int mem;
};
class Derived : public Base {
    void f(Base& another) {
        this->mem++; // OK，可以访问“自己的”
//      another.mem++; // 错误：不能访问“别人的”
    }
};
```

这是因为：如果容许这样做的话，那么实质上就相当于可以更改任何继承了 `Base` 类对象的“基类部分”成员——有点过于“公开”了。

当一个保护成员被公开继承的时候，它仍然是派生类的保护成员。所以派生类的派生类仍然可以访问：
```cpp
class A {
protected:
    int mem;
};
class B : public A {}; // B 是 A 的派生类（公开继承，B 的 mem 是保护成员）
class C : public B {   // C 是 A 的派生类的派生类
    void f() {
        this->mem++; // OK
    }
};
```

当一个保护成员被私有继承的时候，它就是派生类的私有成员了。

类似地，除了公开继承、私有继承还有保护继承。它的效果可以参考上一节的表格。

保护成员和保护继承并不重要（除非备考，否则不用背），但是在日常的使用中有一定可能会用到。
