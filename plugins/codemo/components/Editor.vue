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
  mode: props.lang === 'c' ? "test/x-csrc" : "text/x-c++src",
  theme: "blackboard",
  lineNumbers: true,
  smartIndent: true,
  indentUnit: 4,
};

function onChange(code: string) {
  editorSource.next({ code, lang: props.lang });
}

const CodeMirrorComp = defineAsyncComponent(() => (
  import("codemirror-editor-vue3")
));

onMounted(() => {
  // @ts-ignore
  import("codemirror/mode/clike/clike.js");
})

</script>
<style>
.CodeMirror {
  font-size: 0.85em;
}
</style>
