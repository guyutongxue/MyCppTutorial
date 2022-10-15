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
import * as splitpanes from "splitpanes";
import CodemoView from "./CodemoView.vue";
import CompileView from "./CompileView.vue";

const { Splitpanes, Pane } = splitpanes;

</script>

<style>
.codemo-view {
  min-height: 100%;
  border-radius: 0 !important;
  overflow-x: clip;
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 6px;
  background: var(--c-border);
}
</style>
