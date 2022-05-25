import { addFenceRule, definePluginObject } from "plugins/utils";
import { parse } from "./parser";

const sdscPlugin = definePluginObject({
  name: "vuepress-plugin-sdsc",
  extendsMarkdown: (mdi) => {
    addFenceRule(mdi, "sdsc", ({ content }) => {
      parse(content);
      return null;
    });
  }
});

export { sdscPlugin };
