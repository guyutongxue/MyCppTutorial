import { resolve } from "path";
import type { PluginObject } from "vuepress";
import { path } from "@vuepress/utils";

const codemo = () => {
  return {
    name: 'vuepress-plugin-codemo',
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    onInitialized: (app) => {
      app.layouts['Layout'] = path.resolve(__dirname, "./components/CodemoLayout.vue");
    },
    extendsMarkdown: (mdi) => {
      type RenderRule = NonNullable<typeof mdi.renderer.rules.code_block>;
      const proxy: RenderRule = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
      const defaultFenceRule = mdi.renderer.rules.fence ?? proxy;
      mdi.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (token.info.includes("codemo")) {
          const content = token.content.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          return `<CodemoTrigger code="${content}" />`;
        }
        return defaultFenceRule(tokens, idx, options, env, slf);
      };
    }
  } as PluginObject;
};

export { codemo };
