import { defineClientConfig } from "@vuepress/client";
import SdscBlock from "./components/SdscBlock.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component('SdscBlock', SdscBlock);
  },
});
