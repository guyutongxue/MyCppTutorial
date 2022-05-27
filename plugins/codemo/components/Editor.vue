<template>
  <CodeMirrorComp
    :value="code"
    :options="options"
    style="font-size: inherit"
    @change="onChange"
  ></CodeMirrorComp>
</template>

<script setup lang="ts">
import "codemirror/theme/blackboard.css";
import type { EditorConfiguration } from "codemirror";
import { editorSource } from "./emitter";
import { defineAsyncComponent, onMounted } from "vue";

const props = defineProps<{
  code: string;
  lang?: string;
}>();

const options: EditorConfiguration = {
  mode: props.lang === "c" ? "text/x-csrc" : "text/x-c++src",
  theme: "blackboard",
  lineNumbers: true,
  smartIndent: true,
  indentUnit: 4,
};

function onChange(code: string) {
  editorSource.next({ code, lang: props.lang });
}

// Dynamically import codemirror, or SSR bundler will complain
const CodeMirrorComp = defineAsyncComponent(async () => {
  const comp = import("codemirror-editor-vue3");
  // @ts-ignore
  await import("codemirror/mode/clike/clike.js");
  return comp;
});
</script>
<style>
.CodeMirror {
  font-size: 0.85em;
}
</style>
