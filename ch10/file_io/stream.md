# 流式输入输出

在头文件 `<fstream>` 中，定义了两个类 `std::ifstream` 和 `std::ofstream`。它们可以分别用来写入和读取文件。先看一下使用的例子：

```cpp
#include <fstream>
void write(int n) {
    std::ofstream ofs("w.txt");
    ofs << "Hello, " << n;
}
int read() {
    int n;
    std::ifstream ifs("r.txt");
    ifs >> n;
}
int main() {
    int n{read()};
    write(n);
}
```

虽然还没有具体讲这两个类的含义，但从这个例子上来看，它们的确和 `std::cin` `std::cout` 的用法十分相近。

## `std::*fstream` 对象

`std::ifstream` 和 `std::ofstream`（下合称 `std::*fstream`）作为类，可以构造出相应的对象。不过当构造这两个类的对象时，一般要传入一个字符串作为其要读写的文件路径。比如：
```cpp
std::ofstream a("a.txt");
```
这里构造了对象 `a`，并用 `"a.txt"` 作为构造参数。那么，通过 `a` 的文件写入就都会写入到名为 `a.txt` 的文件之中。类似地，`std::ifstream b("b.txt");` 这样构造的 `b` 会使得从 `b` 的读取都是来自于 `b.txt` 文件。

## 格式化读写

`std::*fstream` 支持格式化的读写，即和 `std::cin` `std::cout` 类似的、基于 `operator>>` `operator<<` 的读写操作。用 `std::ofstream` 举例的话：

```cpp
std::ofstream a("a.txt");
a << "Hello" << 42 << '3' << false;
```

这样，会向 `a.txt` 写入 `Hello4230` 这些内容。从代码上看，`a` 和 `std::cout` 的作用几乎一模一样，只不过 `std::cout` 将写入的内容打印到屏幕上，而 `a` 会将它们保存在 `a.txt` 中。如果是 `std::ifstream` 的话：

```cpp
std::ifstream b("b.txt");
int x, y, z;
b >> x >> y >> z;
```

如果目前 `b.txt` 中存放了 `3 4 5`，那么上面几行代码就会将 `x` 赋值为 3，`y` 赋值为 4，`z` 赋值为 5。同样地，遵循和 `std::cin` 一样的写入规则，比如跳过空白字符等等。若你需要，可以使用 `get` 成员函数或者 `getline` 成员函数实现更复杂的字符或字符串读入。

## 读入失败与 EOF

在上面的例子中，如果 `b.txt` 中没有足够的信息——比如它只有 `3 4` 两个数，那么就会引发 EOF（文件结尾）错误，即程序期望读入一些数据但已经读到了文件末尾。这件事情我们之前提到过，但在文件输入输出上显得更加常见。因此，为了写出更健壮的程序，我们建议经常判断这类错误是否发生。比如，你可以使用 `std::ifstream` 的 `fail` 成员函数。

```cpp
std::ifstream b("b.txt");
int x, y, z;
b >> x >> y >> z;
// 和 std::cin.fail() 类似，判断是否读入失败
if (b.fail()) {
    std::cout << "Read from b.txt failed." << std::endl;
    std::exit(0); // 发生错误便退出程序
}
```

## 无格式读写

之前说的格式化读写都依赖于这样一个事实：写入的文件和待读取的文件都是**文本文件**，也就是人类可读的字符串格式。如果我们想要向其中写入原生的、裸的二进制数据，那就不太好了。

为什么我们需要写入或读取原生二进制数据？因为二进制数据能容纳的信息远远超过文本（字符串）信息。考虑存储一个比较大的数，比如 `123456789`。那么，用原先文本的方式存储它需要 9 个字节来保存，可能还带有额外的、用于分隔数据的空格等；但如果用二进制形式来存储的话，那么一个 `long` 类型的变量就能存放这个值。如果 `long` 类型的大小是 4 个字节，那相比之下直接存储这个 `long` 的二进制数据所占的存储空间是原先文本的一小半。

了解二进制存储数据的必要性后，来看一下如何实现。首先，在构造 `std::*fstream` 时，需要传入额外的第二个参数，表明这是一个用二进制方式读写（或称为“二进制模式”）的流对象。这个额外的参数是 `std::ios::binary`：

```cpp
std::ifstream ifs("a.bin", std::ios::binary);
std::ofstream ofs("b.bin", std::ios::binary);
```

> 实际上这个第二参数与之后所说的无格式读写并没有必然的联系。这个第二参数只是改变了对换行符的处理方式：在文本模式下，操作系统换行符的差异（如 CRLF 和 LF）会被 C++ 屏蔽掉，对用户可见的只有 `'\n'`；而在二进制模式下，不屏蔽这样的差异：CRLF 会原生地读取为 `0x0d` `0x0a`。

在二进制模式的 `std::ofstream` 流中，使用 `write` 成员函数将指定地址、指定长度的数据写入到文件中：

```cpp
// 成员函数 write 将 s 指向的地址及其后面 count 个字节写入到文件
std::ofstream write(const char* s, unsigned count);
```

使用的例子如下。下面这段程序将 `int` 类型的值 42 以二进制形式写入到 `b.bin` 文件中。

```cpp
int n{42};
std::ofstream b("b.bin", std::ios::binary);
b.write(reinterpret_cast<char*>(&n), sizeof(n));
```

注意这里使用了 `reinterpret_cast` 实现从 `int*` 到 `char*` 的转换。由于糟糕的库设计，我们不得不使用这样丑陋的转换（或者 C 风格转换）。

类似地，`std::ifstream` 流的 `read` 成员函数读取若干字节的数据，写入到指定地址中：

```cpp
// 成员函数 read 从文件中读取 count 个字节，写入到 s 指向的地址
std::ifstream read(char* s, unsigned count);
```

使用的例子如下。

```cpp
int n;
std::ifstream a("a.bin", std::ios::binary);
a.read(reinterpret_cast<char*>(&n), sizeof(n));
```
