# 多文件编译实践

本节介绍多文件参与编译的实践层面的问题，即如何配置你的编译环境使得其可接受多个源文件。

## 基本介绍

首先列出作为本节演示用的代码。
```cpp
// main.cpp
#include "hello.h"

int main() {
    sayHello("world");
}
```
```cpp
// hello.h
#ifndef HELLO_H
#define HELLO_H

void sayHello(const char* who);

#endif // HELLO_H
```
```cpp
// hello.cpp
#include "hello.h"

#include <iostream>

void sayHello(const char* who) {
    std::cout << "Hello, " << who << std::endl;
}
```

此处展示了 `main.cpp` `hello.h` 和 `hello.cpp` 三个文件。本章中我已经非常多次地使用这种模式来演示，但现在我将更正式地描述相关细节。首先，这三个文件从后缀名就可以区分成两类：
- `.h` 后缀的头文件（Header file）。在不涉及模板的情形下，头文件一般只存放类型的定义和符号的声明。需要注意的是头文件的作用仅在于被 `.cpp` 文件所包含。因为头文件只含声明，所以单独编译头文件不会产生任何二进制指令（只有定义才是可以让编译产生结果的东西）。也正因如此，在实践中从不会单独编译头文件。
- `.cpp` 后缀的实现文件（Implementation file）。实现文件一般存放对应头文件声明的定义。为了引入相关类型的定义，一般需要将同名头文件也包含进来。（也就是第一行的 `#include "hello.h"`。）每一个实现文件一般都对应着一个翻译单元，这些翻译单元会在最后链接为整个执行程序。`main.cpp` 是特殊的实现文件，其中一般只会包含必需的头文件，并带有一个 main 函数定义作为程序执行的入口。

最后，头文件中一般存在着三条预处理指令：
```cpp
#ifndef XXX_H
#define XXX_H
// [...]
#endif // XXX_H
```

关于这三条预处理指令的具体含义，请参见[附录](/appendix/preprocessor)。简单来讲，它们的含义是防止头文件被多次包含。加上这样三条预处理指令后，一旦发生多次包含，则第二次包含的内容会被处理为空文件，从而防止其中出现类型、模板的重复定义。这三条预处理指令有时被称为包含保护（Include Guard），也可以通过单条的 `#pragma once` 来实现（详见[附录](/appendix/preprocessor)。

## Visual Studio

Windows 下的同学，很幸运你能使用 Visual Studio 这样一个被称作“宇宙第一”的集成开发环境。在 Visual Studio（下简称 VS）中，多文件编译的实践操作非常简单：

在空的 C++ 项目中添加三个文件。点击菜单栏中的“项目”-“添加新项”；`.cpp` 以“C++文件”形式添加，而 `.h` 以“头文件”形式添加：

![](https://z3.ax1x.com/2021/09/11/hzBm1U.png)

添加完成后，“解决方案资源管理器”中就可以看到这些文件分别处在正确的分类下：

![](https://z3.ax1x.com/2021/09/11/hzBt1O.png)

将它们的内容编辑好，就可以轻松地调试和运行了。


## CLion

CLion 内置了 CMake 工具，从而使得多文件编译的操作变得较为简便。

?> [TODO]

## Visual Studio Code + CMake

Visual Studio Code（下简称 VS Code）作为跨平台的编辑器，它通过充分强大的扩展性简化了多文件编译的实践。在一切开始之前，请先：
- 确保你已安装编译器。如果 VS Code 已经配置过，则编译器大多都已安装。
- 你需要安装 [CMake](https://cmake.org)。请在其[下载页面](https://cmake.org/download/)的 binary distribution 表格中选择适用于你操作系统的安装程序，并安装它。
- 在 VS Code 中安装 [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) 和 [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools) 两个扩展。

!> 如果你使用 Windows，请保证接下来的操作决不能出现在带有中文的路径上，否则 CMake 可能无法正常工作。

从 VS Code **打开一个文件夹**。在这个文件夹下：
- 新建一个 `src` 子文件夹，然后将三个 C++ 源文件放进去；
- 新建一个名为 `CMakeLists.txt` 的文件，内容为：

```cmake
cmake_minimum_required(VERSION 3.18.0)

project(HelloWorld)

aux_source_directory(src SOURCES)
add_executable(main ${SOURCES})
```

（其中，`HelloWorld` 是项目名，可以使任意的；`main` 是最终生成的可执行文件名字，也可以是任意的。）现在你的工作区文件夹长成这样：

```
├─src
│  ├─hello.cpp
│  ├─hello.h
│  └─main.cpp
└─CMakeLists.txt
```

然后你需要关闭 VS Code 窗口，然后重新打开。这次打开时，CMake 扩展会自动启动。它启动时可能会弹出你已安装的编译器列表，这时请选择你想要的那个。此外，它会在左侧标签页中添加一个新的图标：

![](https://z3.ax1x.com/2021/08/27/hQ2VjU.png ':size=70')

点进去，点击上面第一个图标。这个过程称为“配置”（Configure），它可能需要一些时间。

![](https://z3.ax1x.com/2021/08/27/hQ2euF.png ':size=300')

配置完成后，点击上面第二个图标。这个过程称为“构建”（Build）——其实就是执行多文件编译的意思。构建时，`CMake` 会通过合理地调用编译器来实现编译和链接。

![](https://z3.ax1x.com/2021/08/27/hQ2nHJ.png ':size=300')

构建完成后，就可以启动最终的可执行文件了。

![](https://z3.ax1x.com/2021/08/27/hQ2KE9.png ':size=300')

## 命令行

事实上几乎所有的 C++ 编译器，都是以命令行界面（Command line interface, CLI）的形式来操作的。因此我不可避免地需要讲一些关于命令行操作的事项——但这需要的篇幅太长，我将其移动到了附录中，如果有兴趣的读者可以前去查看。