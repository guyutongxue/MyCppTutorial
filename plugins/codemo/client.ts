import { defineClientConfig } from "@vuepress/client";
import CodemoLayout from "./components/CodemoLayout.vue";
import CodemoView from "./components/CodemoView.vue";
import CodemoTrigger from "./components/CodemoTrigger.vue";

export default defineClientConfig({
  layouts: {
    Layout: CodemoLayout,
  },
  enhance({ app }) {
    app.component('CodemoView', CodemoView);
    app.component('CodemoTrigger', CodemoTrigger);
  },
});
