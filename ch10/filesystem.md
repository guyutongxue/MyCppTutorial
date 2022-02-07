# 文件系统

C++17 引入了文件系统库。这使得通过 C++ 操作文件系统（如新建、删除、复制文件或目录等）变得非常容易。文件系统库的所有名字位于 `<filesystem>` 头文件下。

不同于其它库，文件系统库的所有名字都位于 `std::filesystem` 命名空间下。比如，判断文件是否存在的函数是 `std::filesystem::exists`，删除文件的函数是 `std::filesystem::remove` 等等。为了行文方便，我们首先引入命名空间别名 `fs` 来指代 `std::filesystem`：

```cpp
namespace fs = std::filesystem;
```

当然你也可以用 `using namespace std::filesystem;` 来省略所有限定名。

## 判断文件存在

`fs::exists` 函数接受一个字符串 `p` 作为参数。如果路径 `p` 存在一个文件或者目录，那么函数返回 `true`，否则返回 `false`。例如：

```cpp
#include <iostream>
#include <filesystem>
namespace fs = std::filesystem;

int main() {
    // 判断 a.txt 是否存在
    if (fs::exists("a.txt")) {
        std::cout << "a.txt exists." << std::endl;
    } else {
        std::cout << "a.txt not exists." << std::endl;
    }
}
```

?> 本节中，“字符串”大多持有“文件路径”的含义。它实际上是 `fs::path` 类的对象，可以从 C 风格字符串、`std::string` 和 `std::string_view` 转换而来。换而言之，凡是期望字符串作为参数的文件系统库函数，实参可以是 C 风格字符串、`std::string` 或 `std::string_view`。

## 新建文件夹

?> 关于如何新建文件而非文件夹（目录），参阅[文件读写](/ch10/file_io/)部分。

使用函数 `fs::create_directories` 来新建文件夹。向它传入一个路径，然后这个函数就会创建该路径对应的文件夹。

```cpp
#include <filesystem>
namespace fs = std::filesystem;

int main() {
    // 新建文件夹 foo，其下创建文件夹 bar，bar 下创建文件夹 baz
    fs::create_directories("foo/bar/baz");
}
```

若这些文件夹部分或全部存在，那么执行该函数不会有任何错误，只是简单地跳过对它们的创建。所以，`fs::create_directories` 用起来还是很舒服的。

这个函数有一个亲戚 `fs::create_directory`，它更严格地要求其所创建的文件夹的父文件夹必须存在，否则抛出异常。

## 删除文件或目录

函数 `fs::remove_all` 可以删除一个文件或者目录。

```cpp
#include <filesystem>
namespace fs = std::filesystem;

int main() {
    // 若 foo 是文件，则删除它；
    // 若 foo 是文件夹，则删除它自己以及其下所有文件
    fs::remove_all("foo");
}
```

若传入的路径是一个文件，则简单地删除它；若传入的路径是一个文件夹，则（递归地）删除这个文件夹下的所有文件，以及文件夹自身。如果该路径不存在，则不会有任何错误。该函数的返回值表明删除了多少个文件。

它的亲戚 `fs::remove` 可用于删除文件和空文件夹，但不能删除含有其它文件的文件夹。

## 复制

`fs::copy` 函数用于复制文件或目录。使用时，传入两个路径参数：第一个是要复制的文件路径，第二个是目标位置。

```cpp
#include <filesystem>
namespace fs = std::filesystem;

int main() {
    // 将 a.txt 复制到 b.txt
    fs::copy("a.txt"，"b.txt");
}
```

复制文件夹时，该文件夹下所有的文件也会被一同复制。若目标文件已存在，则会被覆盖。若目标位置的父文件夹不存在，则导致错误，抛出异常。

## 移动和重命名

`fs::rename` 可用于重命名或移动文件。它的使用方法和 `fs::copy` 类似，但不保留源文件：

```cpp
#include <filesystem>
namespace fs = std::filesystem;

int main() {
    // 将 a.txt 重命名为 b.txt
    fs::rename("a.txt"，"b.txt");
    // 将 b.txt 移动（剪切并粘贴）到 foo/b.txt
    fs::rename("b.txt"，"foo/b.txt");
}
```

同样地，若目标位置已存在文件，则会被覆盖；若目标位置的父文件夹不存在，则导致错误，抛出异常。
