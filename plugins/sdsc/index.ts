import { addFenceRule, definePluginObject } from "../utils";
import { parse } from "./parser";

const sdscPlugin = () => definePluginObject({
  name: "vuepress-plugin-sdsc",
  extendsMarkdown: (mdi) => {
    addFenceRule(mdi, "sdsc", ({ content, token }) => {
      token.content = JSON.stringify(parse(content), undefined, 2);
      return null;
    });
  }
});

export { sdscPlugin };
