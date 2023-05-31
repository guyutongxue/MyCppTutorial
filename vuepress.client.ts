import { defineClientConfig } from "@vuepress/client";
// 以裸字符串形式加载 raphael.js 库。
// 呃，raphael.js 库实在太老了，既不支持 CJS 也不支持 ESM，
// 仅支持（现在已经没人用的）AMD 和 UMD。
// 这里直接向 <head> 添加一个 <script> 标签。
import raphaelSrc from "raphael/raphael.min.js?raw";
import { onMounted } from "vue";

const adobeFontSansSerif = `
(function(d) {
  var config = {
    kitId: 'mdf0gsb',
    scriptTimeout: 3000,
    async: true
  },
  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
})(document);
`;

function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const scriptEle = document.createElement("script");
    scriptEle.innerHTML = src;
    scriptEle.onload = resolve;
    scriptEle.onerror = reject;
    document.head.appendChild(scriptEle);
  });
}

export default defineClientConfig({
  setup() {
    onMounted(() => {
      Promise.all([raphaelSrc, adobeFontSansSerif].map(loadScript));

      // Only show docsearch when using vercel.app domain
      if (location.hostname !== "cpp-tutorial.vercel.app") {
        console.warn(
          "Docsearch removed, because it only works in https://cpp-tutorial.vercel.app ."
        );
        document.querySelector(".DocSearch")?.remove();
      }
    });
  },
});
