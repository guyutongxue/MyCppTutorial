import { defaultTheme, defineUserConfig, viteBundler } from "vuepress";

import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { containerPlugin } from "@vuepress/plugin-container";
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { copyCodePlugin } from "vuepress-plugin-copy-code2";
import { sitemapPlugin } from "vuepress-plugin-sitemap2";
import multimdTable from "markdown-it-multimd-table";

import { ioBlockPlugin } from "./plugins/io-block";
import { codemoPlugin } from "./plugins/codemo";
import { sdscPlugin } from "./plugins/sdsc";
import { path } from "@vuepress/utils";
import { Sidebar } from "./plugins/sidebar";
import { autolinkerPlugin } from "./plugins/autolinker";

const sidebar = new Sidebar({
  sourceDir: path.resolve(__dirname, "src"),
});

export default defineUserConfig({
  lang: "zh-CN",
  title: "谷雨同学的 C++ 教程",
  description: "Learn C++ in a modern way",
  dest: "./dist",
  theme: defaultTheme({
    sidebar: sidebar.forVueDefaultTheme(),
    navbar: ["/contribution"],
    sidebarDepth: 0,
    contributors: false,
    lastUpdatedText: "最近更新",
    themePlugins: {
      container: {
        // 使用自定义版本
        tip: false,
        warning: false,
        danger: false,
      },
      backToTop: false, // 会挡住 codemo
    },
  }),
  alias: {
    "@src": path.resolve(__dirname, "src"),
    "@plugins": path.resolve(__dirname, "plugins"),
  },
  bundler: viteBundler({
    viteOptions: {
      // @ts-expect-error No typing for 'ssr' now
      ssr: {
        // @gytx/gcc-translation is an ESM only package.
        // Vite doesn't support externalize it, see
        // https://vitejs.dev/guide/ssr.html#ssr-externals
        noExternal: ["@gytx/gcc-translation"],
      },
    },
  }),
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
    // autolinker 会使用 JSDOM，它不识别 Vue 组件。
    // 所以不能把它放在会产生 Vue 组件的 codemo 后面
    autolinkerPlugin(),
    codemoPlugin(),
    mdEnhancePlugin({
      // pnpm 下有 bug，改用 npm 即可
      // https://github.com/vuepress-theme-hope/vuepress-theme-hope/issues/1892
      flowchart: true,
      tasklist: true,
      tex: true,
    }),
    docsearchPlugin({
      appId: "LX33TRMJGI",
      apiKey: "2bd18aae3d30f5c2ea161ee554dba6c7",
      indexName: "cpp-tutorial",
      placeholder: "搜索文档",
      translations: {
        button: {
          buttonText: "搜索",
          buttonAriaLabel: "搜索",
        },
        modal: {
          searchBox: {
            resetButtonTitle: "清除",
            resetButtonAriaLabel: "清除",
            cancelButtonText: "取消",
            cancelButtonAriaLabel: "取消",
          },
          startScreen: {
            recentSearchesTitle: "最近搜索",
            noRecentSearchesText: "没有最近搜索",
            saveRecentSearchButtonTitle: "保存此搜索",
            removeRecentSearchButtonTitle: "从历史中移除此搜索",
            favoriteSearchesTitle: "收藏",
            removeFavoriteSearchButtonTitle: "从收藏中移除此搜索",
          },
          errorScreen: {
            titleText: "无法获取结果",
            helpText: "你可能需要检查你的网络连接情况",
          },
          footer: {
            selectText: "选择",
            selectKeyAriaLabel: "回车键",
            navigateText: "导航",
            navigateUpKeyAriaLabel: "方向上键",
            navigateDownKeyAriaLabel: "方向下键",
            closeText: "关闭",
            closeKeyAriaLabel: "Esc 键",
            searchByText: "技术支持",
          },
          noResultsScreen: {
            noResultsText: "找不到",
            suggestedQueryText: "尝试搜索",
            reportMissingResultsLinkText: "如果你认为此搜索应当返回结果，请",
            reportMissingResultsText: "告诉我们。"
          }
        }
      },
    }),
    sitemapPlugin({
      hostname: "https://cpp-tutorial.vercel.app",
    }),
    copyCodePlugin({
      selector: [
        '.theme-default-content div[class*="language-c"] pre:not(.dirty)',
        '.hidden-copycode-codeblock'
      ]
    }),
    ioBlockPlugin(),
    sdscPlugin(),
    sidebar.forPlugin(),
  ],
  extendsMarkdown: (mdi) => {
    mdi.use(multimdTable, {
      rowspan: true
    });
  }
});
