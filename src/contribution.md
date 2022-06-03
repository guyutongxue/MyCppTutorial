# 关于本项目

目前，本项目基于 [VuePress](https://v2.vuepress.vuejs.org) 系统。项目将由 [Vercel](https://vercel.com) 自动构建并托管。

## [待办清单](/todo)

## 历史

- [GitBook](https://www.gitbook.com/)、[看云](https://www.kancloud.cn/)、[语雀](https://www.yuque.com)等商业平台
- [Docsify](https://docsify.js.org)
- [VuePress](https://v2.vuepress.vuejs.org)

## 插件

本项目使用的插件包括：

- @vuepress/plugin-active-header-links（主题自带）
- @vuepress/plugin-container
- @vuepress/plugin-external-link-icon（主题自带）
- @vuepress/plugin-git（主题自带）
- @vuepress/plugin-medium-zoom（主题自带）
- @vuepress/plugin-nprogress（主题自带）
- vuepress-plugin-md-enhance
- vuepress-plugin-copy-code2
- vuepress-plugin-codemo（自制）
- vuepress-plugin-io-block（自制）
- vuepress-plugin-sdsc（自制）
- vuepress-plugin-sidebar（自制）

### Codemo

加载 Codemo 后，页面右侧会常驻代码视图。对于标记为

~~~md
```cpp codemo
// I am some code
```
~~~

```cpp codemo
// I am some code
#error
```
的代码块，会渲染为如右所示的“触发按钮”；点击该按钮在代码视图中显示代码。由于触发按钮是浮动布局，所以应该在描述文本**之前**使用 `codemo` 代码块。（这有一点反直觉，但我找不到更好的处理方式。）

`codemo` 可带逗号分隔的参数：
- `codemo(show)` 仍照常显示代码框，但在右上角增加触发按钮；
- `codemo(text=...)` 更改 title 提示文字。
- `codemo(clear)` 清除浮动：当两个触发按钮距离过短的时候，后者会向左浮动；这很丑。在后者添加此参数以改为向下浮动。
- `codemo(focus=...)` 更改聚焦行：默认情况下，代码将聚焦到新添加的行上。此设定可更改聚焦，参数形式为 `行号/范围起-范围讫`，行号零起始。例：`codemo(focus=0/2-4)` 将聚焦到 1、3、4、5 行。
- `codemo(input=...)` `codemo(input)` 设置运行时输入。带实参时，Codemo 运行时输入将被设置；不带实参时，将保持 Codemo 运行时输入不变。否则（不带 input 参数），输入设置为空字符串。注意：
    - 输入中不能包含逗号（否则会被解析为不同的参数），需用 `;` 转义，`;` 使用 `\;` 转义；
    - 首尾不能带空格（会被 trim 掉），需用 `_` 转义；`_` 使用 `\_` 转义；
    - 换行使用 `\n`；反斜杠使用 `\\`。

### IO Block

形如
~~~
```io
¶12 24↵
36
```
~~~

的代码块会解释为输入输出（终端界面，如下）。介于 `¶` 和 `↵` 之间的内容视为用户输入，显示不同的字体。`¶` 不会显示。

```io
¶12 24↵
36
```

### SDSC

[SDSC](https://en.cppreference.com/mwiki/index.php?title=Template:sdsc) 是一个取自 [CppReference](https://zh.cppreference.com) 的概念，应该是 Syntax description 的缩写，指 C++ 标准文本中类 EBNF 格式的文法描述段落。自制的插件 `vuepress-plugin-sdsc` 可以通过下述语法的代码块生成对应的 SDSC 段落。

SDSC 描述中包含以下要素：
- 裸字符串 `"sth"`；
- 占位符 `phd`；
- 或 `|`；
- 块 `(...)`；
- 可选块 `[...]`。

比如 SDSC 描述

~~~md
```sdsc
"My name is" name"," ("male"|"female")[", and I love coding!"].
```
~~~

会生成如下 SDSC 段落：

```sdsc
"My name is" name"," ("male"|"female")[", and I love coding!"].
```

同时，为了保证统一的阅读体验，支持简单的行内 SDSC，格式是 `` `@...@` ``。行内 SDSC 仅支持裸字符串和占位符。在行内 SDSC 的裸字符串内，`"` 用 `@` 代替。

### 侧边栏

VuePress 的侧边栏设计思路和 Doxygen 等常见文档完全不同。它们的世界里，树形文档结构只存在于标题之间，文档之间的树形结构支持得很差。（官方维护人员称“not recommended”。）总之，这给我带来了不少的麻烦。

然而 VuePress default theme 功能又很全，我可不愿意重头造轮子。所以，我的做法是在运行 VuePress 前通过一个自定义的配置文件 `sidebar.yml` 提前生成一个树形的侧边栏结构，然后由这个结构覆盖到对应的 VuePress default theme 字段上。这个思路不是什么好办法，不仅会拖慢构建速度，而且要求用户必须将 sourceDir 写死在 `vuepress.config.ts`。但不管怎样，至少它能工作。

