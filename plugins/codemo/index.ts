import { resolve } from "path";
import type { PluginObject } from "vuepress";
import { path } from "@vuepress/utils";

const codemo = () => {
  return {
    name: "vuepress-plugin-codemo",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    onInitialized: (app) => {
      app.layouts["Layout"] = path.resolve(
        __dirname,
        "./components/CodemoLayout.vue"
      );
    },
    extendsMarkdown: (mdi) => {
      type RenderRule = NonNullable<typeof mdi.renderer.rules.code_block>;
      const proxy: RenderRule = (tokens, idx, options, env, self) =>
        self.renderToken(tokens, idx, options);
      const defaultFenceRule = mdi.renderer.rules.fence ?? proxy;
      mdi.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const defaultHtml = defaultFenceRule(tokens, idx, options, env, slf);
        const token = tokens[idx];
        const [lang, ...others] = token.info.split(" ");
        const attr = others.join(" ");
        if (attr.startsWith("codemo")) {
          const lParen = attr.indexOf("(");
          const rParen = attr.indexOf(")");
          let open = false;
          let text = "显示代码";
          if (lParen > 0 && rParen > lParen) {
            attr
              .substring(lParen + 1, rParen)
              .split(",")
              .map((s) => s.split("=").map((s) => s.trim()))
              .forEach(([key, value]) => {
                if (key === "open") {
                  open = true;
                } else if (key === "text") {
                  text = value;
                }
              });
          }
          const content = token.content
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;");
          return `<div style="position: relative; margin: 1em 0;">
  <details ${open ? 'open' : ''}>
    <summary style="display: flex; flex-direction: row; justify-content: end; padding: 1rem">
      <div 
        style="display: flex; width: 1rem; height: 1rem; justify-content: center; align-items: center" 
        title="在文档中显示"
      >
        <div style="width: 0.5rem; height: 0.5rem; box-shadow: 2px 2px; transform: rotate(45deg)">
        </div>
      </div>
    </summary>
    ${defaultHtml}
  </details>
  <CodemoTrigger
    style="position: absolute; left: 0; top: 0; right: 3rem; padding: 1rem; border-radius: 6px;"
    lang="${lang}"
    code="${content}"
  >
    ${text}
  </CodemoTrigger>
</div>`;
        }
        return defaultHtml;
      };
    },
  } as PluginObject;
};

export { codemo };
