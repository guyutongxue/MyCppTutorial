import {
  defaultTheme,
  DefaultThemeLocaleOptions,
  defineUserConfig,
  SidebarConfig,
} from "vuepress";
import { codemo } from "./plugins/codemo";
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { searchPlugin } from "@vuepress/plugin-search";

const SIDEBAR: SidebarConfig = [
  "/README.md",
  {
    text: "第〇章 基本概念",
    link: "/ch00/",
    collapsible: true,
    children: [
      "/ch00/computer.md",
      "/ch00/programming.md",
      "/ch00/programming_language.md",
    ],
  },
  {
    text: "第一章 感性认识 C++ 程序",
    link: "/ch01/",
    collapsible: true,
    children: [
      "/ch01/environment.md",
      "/ch01/first_program.md",
      "/ch01/more_output.md",
      "/ch01/input.md",
      "/ch01/assignment_and_if.md",
      "/ch01/loop.md",
      "/ch01/integrated_use.md",
      "/ch01/summary.md",
    ],
  },
  {
    text: "第二章 理性认识 C++ 程序",
    link: "/ch02/",
    collapsible: true,
    children: [
      {
        text: "第 1 部分 数据成分",
        link: "/ch02/part1/",
        children: [
          "/ch02/part1/declaration_statement.md",
          {
            text: "类型系统",
            link: "/ch02/part1/type_system/",
            children: [
              "/ch02/part1/type_system/integer_type.md",
              "/ch02/part1/type_system/float_type.md",
              "/ch02/part1/type_system/boolean_type.md",
              "/ch02/part1/type_system/character_type.md",
            ],
          },
          "/ch02/part1/constant.md",
          "/ch02/part1/readonly_variable.md",
          "/ch02/part1/array_glance.md",
        ],
      },
      {
        text: "第 2 部分 运算成分",
        link: "/ch02/part2/",
        children: [
          "/ch02/part2/arithmetic_operator.md",
          "/ch02/part2/assignment_operator.md",
          "/ch02/part2/incdec_operator.md",
          "/ch02/part2/comparison_operator.md",
          "/ch02/part2/logical_operator.md",
          "/ch02/part2/other_operator.md",
          "/ch02/part2/bit_operator.md",
          "/ch02/part2/implicit_conversion.md",
        ],
      },
      {
        text: "第 3 部分 控制成分",
        link: "/ch02/part3/",
        children: [
          "/ch02/part3/compound_statement.md",
          "/ch02/part3/if_statement.md",
          "/ch02/part3/switch_statement.md",
          "/ch02/part3/while_statement.md",
          "/ch02/part3/for_statement.md",
          "/ch02/part3/jump_statement.md",
          "/ch02/part3/null_statement.md",
          "/ch02/part3/scope.md",
        ],
      },
      "/ch02/summary.md",
    ],
  },
  {
    text: "第三章 过程式编程",
    link: "/ch03/",
    collapsible: true,
    children: [
      "/ch03/function_glance.md",
      "/ch03/function.md",
      "/ch03/function_definition.md",
      "/ch03/function_execution.md",
      "/ch03/scope_again.md",
      "/ch03/review_cpp.md",
      "/ch03/recursion.md",
      "/ch03/summary.md",
    ],
  },
];

export default defineUserConfig({
  lang: "zh-CN",
  title: "谷雨同学的 C++ 教程",
  description: "Learn C++ in a modern way",
  public: "./public",
  theme: defaultTheme({
    sidebar: SIDEBAR,
    sidebarDepth: 0,
    contributors: false,
    lastUpdatedText: '最近更新',
    themePlugins: {
      // prismjs: false
    }
  } as DefaultThemeLocaleOptions),
  plugins: [
    codemo(),
    mdEnhancePlugin({
      tex: true,
    }),
    searchPlugin()
  ],
});
