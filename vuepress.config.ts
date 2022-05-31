import {
  defaultTheme,
  defineUserConfig,
  type SidebarConfig,
} from "vuepress";

import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { searchPlugin } from "@vuepress/plugin-search";
import { copyCodePlugin } from "vuepress-plugin-copy-code2";
import { containerPlugin } from "@vuepress/plugin-container";

import { ioBlockPlugin } from "./plugins/io-block";
import { codemoPlugin } from "./plugins/codemo";
import { sdscPlugin } from "./plugins/sdsc";
import { path } from "@vuepress/utils";

const SIDEBAR: SidebarConfig = [
  "/preface.md",
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
  {
    text: "第四章 POD 类型与结构",
    link: "/ch04/",
    collapsible: true,
    children: [
      {
        text: "数组",
        link: "/ch04/array/",
        children: [
          "/ch04/array/array_init.md",
          "/ch04/array/2d_array.md",
          "/ch04/array/array_usage.md",
          "/ch04/array/c_string.md",
        ],
      },
      {
        text: "输入输出成分",
        link: "/ch04/io/",
        children: [
          "/ch04/io/input.md",
          "/ch04/io/input_fail.md",
          "/ch04/io/output.md",
        ],
      },
      {
        text: "指针",
        link: "/ch04/pointer/",
        children: [
          "/ch04/pointer/pointer.md",
          "/ch04/pointer/pointer_def.md",
          "/ch04/pointer/pointer_usage.md",
          "/ch04/pointer/pointer_and_array.md",
          "/ch04/pointer/pointer_def_2.md",
        ],
      },
      {
        text: "结构体",
        link: "/ch04/struct/",
        children: [
          "/ch04/struct/struct_def.md",
          "/ch04/struct/struct_usage.md",
        ],
      },
      {
        text: "链表",
        link: "/ch04/list/",
        children: [
          "/ch04/list/storage_duration.md",
          "/ch04/list/list_construct.md",
          "/ch04/list/list_add_del.md",
          "/ch04/list/arr_new_del.md",
          "/ch04/list/safety.md",
        ],
      },
      "/ch04/enum.md",
      "/ch04/union.md",
      {
        text: "迁移到 C 语言(选读)",
        link: "/ch04/compare_with_c/",
        children: [
          "/ch04/compare_with_c/c_io.md",
          "/ch04/compare_with_c/c_feature.md",
        ],
      },
      "/ch04/summary.md",
    ],
  },
  {
    text: "第五章 初探面向对象",
    link: "/ch05/",
    collapsible: true,
    children: [
      "/ch05/reference.md",
      "/ch05/easy_string.md",
      "/ch05/constructor.md",
      "/ch05/overload.md",
      "/ch05/copy_constructor.md",
      "/ch05/defaulted_constructor.md",
      "/ch05/shallow_deep_copy.md",
      "/ch05/misc.md",
      "/ch05/summary.md",
    ],
  },
  {
    text: "第六章 运算符重载",
    link: "/ch06/",
    collapsible: true,
    children: [
      "/ch06/this.md",
      "/ch06/assignment_overload.md",
      "/ch06/assignment_vs_construct.md",
      "/ch06/cast_overload.md",
      "/ch06/noninline_member_function.md",
      "/ch06/const_member_function.md",
      "/ch06/static_member.md",
      "/ch06/nonmember_operator.md",
      "/ch06/friend.md",
      "/ch06/special_operator_overload.md",
      "/ch06/summary.md",
    ],
  },
  {
    text: "第七章 继承与多态",
    link: "/ch07/",
    collapsible: true,
    children: [
      "/ch07/object_relationships.md",
      {
        text: "继承关系",
        link: "/ch07/inheritance/",
        children: [
          "/ch07/inheritance/derived_constructor.md",
          "/ch07/inheritance/protected_member.md",
          "/ch07/inheritance/about_member_name.md",
          "/ch07/inheritance/implicit_cast_in_inheritance.md",
          "/ch07/inheritance/misc.md",
        ],
      },
      {
        text: "多态",
        link: "/ch07/polymorphism/",
        children: [
          "/ch07/polymorphism/virtual_function.md",
          "/ch07/polymorphism/cpp_cast.md",
          "/ch07/polymorphism/rtti.md",
          "/ch07/polymorphism/abstract_class.md",
          "/ch07/polymorphism/virtual_destructor.md",
          "/ch07/polymorphism/override_and_final.md",
        ],
      },
      "/ch07/mi.md",
      "/ch07/summary.md",
    ],
  },
  {
    text: "第八章 模板基础",
    link: "/ch08/",
    collapsible: true,
    children: [
      "/ch08/function_template.md",
      "/ch08/class_template.md",
      "/ch08/nontype_template_param.md",
      "/ch08/default_argument.md",
      {
        text: "STL 容器与迭代器",
        link: "/ch08/stl_containers/",
        children: [
          "/ch08/stl_containers/vector.md",
          "/ch08/stl_containers/other_sequence.md",
          "/ch08/stl_containers/iterator_glance.md",
          "/ch08/stl_containers/iterator_concept.md",
          "/ch08/stl_containers/iterator_usage.md",
          "/ch08/stl_containers/set.md",
          "/ch08/stl_containers/map.md",
          "/ch08/stl_containers/adaptors.md",
        ],
      },
      "/ch08/summary.md",
    ],
  },
  {
    text: "第九章 链接(选读)",
    link: "/ch09/",
    collapsible: true,
    children: [
      "/ch09/symbol_and_linkage.md",
      "/ch09/odr.md",
      "/ch09/inline.md",
      "/ch09/template_linking.md",
      "/ch09/friend_in_template.md",
      "/ch09/compile_multiple_files.md",
      "/ch09/c_linking.md",
    ],
  },
  {
    text: "第十章 常用库介绍",
    link: "/ch10/",
    collapsible: true,
    children: [
      {
        text: "文件读写",
        link: "/ch10/file_io/",
        children: ["/ch10/file_io/stream.md", "/ch10/file_io/c_io.md"],
      },
      "/ch10/filesystem.md",
      "/ch10/random.md",
    ],
  },
  {
    text: "第十一章 函数式编程(待续)",
    link: "/ch11/",
    collapsible: true,
    children: [
      {
        text: "语法基础",
        link: "/ch11/grammar/",
        children: [
          "/ch11/grammar/function_as_object.md",
          "/ch11/grammar/lambda.md",
          "/ch11/grammar/closure.md",
          "/ch11/grammar/lambda_capture.md",
          "/ch11/grammar/higher_order_function.md",
        ],
      },
      {
        text: "STL 算法",
        link: "/ch11/stl_algorithms/",
        children: [
          "/ch11/stl_algorithms/sort.md",
          "/ch11/stl_algorithms/copy.md",
          "/ch11/stl_algorithms/immutable_seq.md",
          "/ch11/stl_algorithms/others.md",
          "/ch11/stl_algorithms/defaulted_compare.md",
          "/ch11/stl_algorithms/adl.md",
        ],
      },
    ],
  },
  // {
  //   text: "第十二章 模板",
  //   link: "/ch12/",
  //   collapsible: true,
  //   children: ["/ch12/concept.md"],
  // },
  {
    text: "附录",
    link: "/appendix/",
    collapsible: true,
    children: [
      "/appendix/operator.md",
      "/appendix/keyword.md",
      "/appendix/preprocessor.md",
      "/appendix/coding_style.md",
      "/appendix/cli.md",
      {
        text: "ASCII 码表",
        link: "https://www.kdocs.cn/l/sLP90gSzs ':target=_blank'",
      },
    ],
  },
  "/postscript.md",
];

export default defineUserConfig({
  lang: "zh-CN",
  title: "谷雨同学的 C++ 教程",
  description: "Learn C++ in a modern way",
  public: "./public",
  theme: defaultTheme({
    sidebar: SIDEBAR,
    navbar: ["/contribution"],
    sidebarDepth: 0,
    contributors: false,
    lastUpdatedText: "最近更新",
    themePlugins: {
      container: { // 使用自定义版本
        tip: false,
        warning: false,
        danger: false
      },
      backToTop: false, // 会挡住 codemo
    },
  }),
  alias: {
    "@src": path.resolve(__dirname, "src"),
  },
  plugins: [
    containerPlugin({
      type: "tip",
      locales: {
        "/": {
          defaultInfo: "提示",
        },
      },
    }),
    containerPlugin({
      type: "warning",
      locales: {
        "/": {
          defaultInfo: "注意",
        },
      },
    }),
    containerPlugin({
      type: "danger",
      locales: {
        "/": {
          defaultInfo: "危险",
        },
      },
    }),
    codemoPlugin(),
    mdEnhancePlugin({
      // pnpm 下有 bug，改用 npm 即可
      // https://github.com/vuepress-theme-hope/vuepress-theme-hope/issues/1892
      flowchart: true,
      tasklist: true,
      tex: true,
    }),
    searchPlugin(),
    copyCodePlugin({
      selector: '.theme-default-content div[class*="language-c"] pre',
    }),
    ioBlockPlugin(),
    sdscPlugin(),
  ],
});
