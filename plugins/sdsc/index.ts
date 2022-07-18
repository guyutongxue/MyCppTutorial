import { path } from "@vuepress/utils";
import { escapeHtml } from "markdown-it/lib/common/utils";
import type { RenderRule } from "markdown-it/lib/renderer";
import { addFenceRule, definePluginObject } from "../utils";
import { parse } from "./parser";

export const sdscPlugin = () =>
  definePluginObject({
    name: "vuepress-plugin-sdsc",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    extendsMarkdown: (mdi) => {
      addFenceRule(mdi, "sdsc", ({ content }) => {
        const nodes = parse(content);
        return `<SdscBlock nodesJson="${escapeHtml(JSON.stringify(nodes))}" />`;
      });
      // inline
      {
        const proxy: RenderRule = (tokens, idx, options, env, self) =>
          self.renderToken(tokens, idx, options);
        const defaultFn = mdi.renderer.rules.code_inline ?? proxy;
        mdi.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
          const token = tokens[idx];
          if (/^@.*@$/.test(token.content)) {
            token.content = token.content.slice(1, -1);
            const html = defaultFn(tokens, idx, options, env, slf);
            return html
              .replace(/<code/, `<code class="sdsc-inline"`)
              .replace(/&quot;(.*?)&quot;/g, (m, p1) => {
                return `<span class="string">${p1.replace(/@/g, '&quot;')}</span>`;
              });
          } else {
            return defaultFn(tokens, idx, options, env, slf);
          }
        };
      }
    },
  });
