<template>
  <Splitpanes horizontal>
    <Pane>
      <CodemoView class="codemo-view"></CodemoView>
    </Pane>
    <Pane>
      <CompileView></CompileView>
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
// @ts-ignore
import { Splitpanes, Pane } from "splitpanes";
import CodemoView from "./CodemoView.vue";
import CompileView from "./CompileView.vue";

</script>

<style>
.codemo-view {
  min-height: 100%;
  border-radius: 0 !important;
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 6px;
  background: var(--c-border);
}
</style>
