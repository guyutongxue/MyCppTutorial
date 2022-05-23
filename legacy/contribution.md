# 关于本项目

目前，本项目基于 Docsify 工具，将 Markdown 文件动态解析为 HTML 显示。

## 插件

本项目使用的插件包括：

- Prism (add line-numbers plugin)
- docsify-katex
- docsify-themeable
- docsify-sidebar-collapse
- docsify-pagination
- docsify-copy-code

## 扩展语法

本项目使用的 Docsify 自带扩展语法包括：

- `?>` 提示框
- `!>` 警告框
  
本项目自定义的语法包括：

- 标准说明代码框 <code>\`\`\`sdsc</code> 和输入输出代码框 <code>\`\`\`io</code>。
- 标准说明行内代码 <code>\`@@\`</code>

## 代码在线运行

- 若代码块使用大写 `CPP` 作为语言标记，则表明这段代码为完整的、可编译的代码。将在下方添加“运行此代码”的链接。
- 除此之外的代码块使用小写 `cpp` 作为语言标记，将正常解析。