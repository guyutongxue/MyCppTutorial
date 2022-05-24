import { resolve } from "path";
import type { PluginObject } from "vuepress";
import { path } from "@vuepress/utils";
import { definePluginObject, addFenceRule } from "../utils";

const codemoPlugin = () => {
  return definePluginObject({
    name: "vuepress-plugin-codemo",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    onInitialized: (app) => {
      app.layouts["Layout"] = path.resolve(
        __dirname,
        "./components/CodemoLayout.vue"
      );
    },
    extendsMarkdown: (mdi) => {
      addFenceRule(
        mdi,
        (lang, attr) =>
          ["c", "cpp"].includes(lang) && attr.startsWith("codemo"),
        ({ content, lang, attr, defaultFn }) => {
          const lParen = attr.indexOf("(");
          const rParen = attr.indexOf(")");
          let show = false;
          let clear = false;
          let text = "显示代码";
          if (lParen > 0 && rParen > lParen) {
            attr
              .substring(lParen + 1, rParen)
              .split(",")
              .map((s) => s.split("=").map((s) => s.trim()))
              .forEach(([key, value]) => {
                if (key === "show") {
                  show = true;
                } else if (key === "text") {
                  text = value;
                } else if (key === "clear") {
                  clear = true;
                }
              });
          }
          const escapedContent = content
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;");
          if (show)
            return `<div style="position: relative">
  ${defaultFn()}
  <CodemoTrigger class="show" title="${text}" lang="${lang}" code="${escapedContent}">
    ${text}
  </CodemoTrigger>
</div>`;
          else
            return (
              (clear ? `<div style="clear: right"></div>` : "") +
              `<CodemoTrigger title="${text}" lang="${lang}" code="${escapedContent}" />`
            );
        }
      );
    },
  });
};

export { codemoPlugin };
