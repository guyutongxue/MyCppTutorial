import { defineClientConfig } from "@vuepress/client";
import { onMounted } from "vue";

// Client should hide the input marker by CSS.

export default defineClientConfig({
  setup() {
    onMounted(() => {
      const ele = document.createElement("style");
      ele.innerHTML = `/* Hide input-marker in io code block */
.token .input-marker {
  display: none;
}`;
      document.head.appendChild(ele);
    });
  },
});
