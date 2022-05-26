<template>
  <CodeMirror
    :value="code"
    :options="options"
    style="font-size: inherit"
    @change="onChange"
  ></CodeMirror>
</template>

<script setup lang="ts">
import CodeMirror from "codemirror-editor-vue3";
import "codemirror/mode/clike/clike.js";
import "codemirror/theme/blackboard.css";
import type { EditorConfiguration } from "codemirror";
import { editorSource } from "./emitter";

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
</script>
<style>
.CodeMirror {
  font-size: 0.85em;
}
</style>
