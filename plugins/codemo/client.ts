import { defineClientConfig } from "@vuepress/client";
import CodemoView from "./components/CodemoView.vue";
import CodemoTrigger from "./components/CodemoTrigger.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component('CodemoView', CodemoView);
    app.component('CodemoTrigger', CodemoTrigger);
  },
});
