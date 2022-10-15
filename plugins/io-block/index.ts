import { addFenceRule, definePluginObject } from "../utils";
import { path } from "@vuepress/utils";
import type { Grammar } from "prismjs";
import Prism from "prismjs";

const IO_GRAMMAR: Grammar = {
  input: {
    pattern: /¶.*↵/,
    inside: {
      "input-marker": /¶/,
      string: /[^↵]*↵/,
    },
  },
};

const ioBlockPlugin = () => {
  return definePluginObject({
    name: "vuepress-plugin-io-block",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    extendsMarkdown: (mdi) => {
      // 为 Token 添加 :no-line-numbers 属性，VuePress 内置插件会处理它
      addFenceRule(
        mdi,
        "io",
        ({ token }) => ((token.info = "io:no-line-numbers"), null)
      );
    },
  });
};

// Should add the grammar immediately when importing this file.
// `onInitialized` is too late, that `markdown.codePlugin` may already be called.
Prism.languages["io"] = IO_GRAMMAR;

export { ioBlockPlugin };
