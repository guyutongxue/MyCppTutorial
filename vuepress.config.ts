import { defaultTheme, defineUserConfig, viteBundler } from "vuepress";

import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { searchPlugin } from "@vuepress/plugin-search";
import { copyCodePlugin } from "vuepress-plugin-copy-code2";
import { containerPlugin } from "@vuepress/plugin-container";

import { ioBlockPlugin } from "./plugins/io-block";
import { codemoPlugin } from "./plugins/codemo";
import { sdscPlugin } from "./plugins/sdsc";
import { path } from "@vuepress/utils";
import { Sidebar } from "./plugins/sidebar";

const sidebar = new Sidebar({
  sourceDir: path.resolve(__dirname, "src"),
});

export default defineUserConfig({
  lang: "zh-CN",
  title: "谷雨同学的 C++ 教程",
  description: "Learn C++ in a modern way",
  public: "./public",
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
    sidebar.forPlugin(),
  ],
});
