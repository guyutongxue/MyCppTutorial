# C 输入输出

在 C++ 中，我们用 `cin` 和 `cout` 来控制输入输出；然而在 C 中，我们需要用两个函数
```c
int scanf(const char*, ...);
int printf(const char*, ...);
```
来做这件事情。比如
```cpp
int a{42};
cin >> a;
cout << a;
```
需要替换成
```c
int a = 42;
scanf("%d", &a);
printf("%d", a);
```

## 占位符

