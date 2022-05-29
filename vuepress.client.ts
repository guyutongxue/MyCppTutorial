import { defineClientConfig } from "@vuepress/client";
// 以裸字符串形式加载 raphael.js 库。
// 呃，raphael.js 库实在太老了，既不支持 CJS 也不支持 ESM，
// 仅支持（现在已经没人用的）AMD 和 UMD。
// 这里直接向 <head> 添加一个 <script> 标签。
// @ts-expect-error: Vite ?raw directive no typing
import raphaelSrc from "raphael/raphael.min.js?raw";

export default defineClientConfig({
  setup: async () => {
    await new Promise((resolve, reject) => {
      const scriptEle = document.createElement("script");
      scriptEle.innerHTML = raphaelSrc;
      scriptEle.onload = resolve;
      scriptEle.onerror = reject;
      document.head.appendChild(scriptEle);
    });
  },
});
