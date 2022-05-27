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

### IO Block

形如
~~~
```io
¶12 24↵
36
```
~~~

的代码块会解释为输入输出（终端界面）。介于 `¶` 和 `↵` 之间的内容视为用户输入，显示不同的字体。`¶` 不会显示。

## 注意

### frontmatter

> frontmatter 即 Markdown 头的 YAML 字段。

不同于 Docsify，VuePress 在解析下一页使用的算法是下一个同级页面，而非次级页面。所以，所有的 `README.md` 必须加上
```md
---
next: # some_page.md
---
```
这样的头。

### 侧边栏

侧边栏定义在 `vuepress.config.ts` 里的 `SIDEBAR`。大部分页面只需给出路径即可；但对于有子节点的页面，必须给出标题（我不知道为什么，但就这样规定的）。

