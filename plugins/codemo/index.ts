import { path } from "@vuepress/utils";
import { escapeHtml } from "markdown-it/lib/common/utils";
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
          let focus: number[] = [];
          let input: string | undefined = "";
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
                } else if (key === "focus") {
                  focus = value.split("/").flatMap((part) => {
                    const dash = part.indexOf("-");
                    const lines = [];
                    if (dash > 0) {
                      const start = parseInt(part.substring(0, dash));
                      const end = parseInt(part.substring(dash + 1));
                      if (start < 0 || end < start) {
                        throw new Error(`invalid focus: ${part}`);
                      }
                      for (let i = start; i <= end; i++) {
                        lines.push(i);
                      }
                    } else {
                      const line = parseInt(part);
                      if (line < 0) {
                        throw new Error(`invalid focus: ${part}`);
                      }
                      lines.push(line);
                    }
                    return lines;
                  });
                } else if (key === "input") {
                  if (typeof value === "undefined") {
                    input = value;
                  } else {
                    input = value
                      .replace(/_/g, " ")
                      .replace(/;/g, ",")
                      .replace(/\\,/g, ";")
                      .replace(/\\n/g, "\n")
                      .replace(/\\ /g, "_")
                      .replace(/\\,/g, ",")
                      .replace(/\\\\/g, "\\");
                  }
                }
              });
          }
          const escapedContent = escapeHtml(content);
          const props = `
title="${text}"
lang="${lang}"
code="${escapedContent}"
${focus.length > 0 ? `focus="${focus.join(",")}"` : ""}
${typeof input !== "undefined" ? `input="${input}"` : ""}`;
          if (show)
            return `<div style="position: relative">
  ${defaultFn()}
  <CodemoTrigger class="show" ${props}>
    ${text}
  </CodemoTrigger>
</div>`;
          else
            return (
              (clear ? `<div style="clear: right"></div>` : "") +
              `<CodemoTrigger ${props} />`
            );
        }
      );
    },
  });
};

export { codemoPlugin };
