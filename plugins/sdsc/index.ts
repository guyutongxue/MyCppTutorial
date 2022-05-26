import { path } from "@vuepress/utils";
import { escapeHtml } from "markdown-it/lib/common/utils";
import { addFenceRule, definePluginObject } from "../utils";
import { parse } from "./parser";

const sdscPlugin = () =>
  definePluginObject({
    name: "vuepress-plugin-sdsc",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    extendsMarkdown: (mdi) => {
      addFenceRule(mdi, "sdsc", ({ content }) => {
        const nodes = parse(content);
        return `<SdscBlock nodesJson="${escapeHtml(JSON.stringify(nodes))}" />`;
      });
    },
  });

export { sdscPlugin };
