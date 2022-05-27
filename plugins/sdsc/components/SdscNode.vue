<template>
  <span v-if="node.type === 'raw'" class="sdsc raw"> {{ node.value }} </span>
  <span v-else-if="node.type === 'placeholder'" class="sdsc placeholder">
    {{ node.value }}
  </span>
  <span v-else-if="node.type === 'or'" class="sdsc or"></span>
  <span v-else-if="node.type === 'group'" class="sdsc group">
    <span v-for="child of node.children">
      <SdscNode :node="child" />
    </span>
  </span>
  <span v-else-if="node.type === 'opt'" class="sdsc opt">
    <span v-for="child of node.children">
      <SdscNode :node="child" />
    </span>
  </span>
  <span v-else-if="node.type === 'repeat'" class="sdsc repeat">
    <span v-for="child of node.children">
      <SdscNode :node="child" />
    </span>
  </span>
</template>

<script setup lang="ts">
import type { Node } from "../parser";

const props = defineProps<{
  node: Node;
}>();
</script>

<style>

:root {
  --sdsc-color: 11, 135, 218;
}

.sdsc.opt {
  display: inline-block;
  padding: 2px;
  background-color: rgba(var(--sdsc-color), 0.15);
  border-radius: 3px;
}
.sdsc.placeholder {
  color: rgb(var(--sdsc-color));
}
.sdsc.group {
  padding: 1px;
  border: 1px solid rgb(var(--sdsc-color));
  border-radius: 3px;
  overflow: hidden;
}
.sdsc.or {
  height: calc(1.2em + 5px);
  width: 2em;
  margin: 0;
  margin-bottom: calc(-0.2em - 3px);
  border: none;
  display: inline-block;
  border-bottom: 0;
  background-image: url(/assets/or.svg);
  background-size: calc(1.2em + 6px) calc(1.2em + 6px);
  background-position: 0.2em 0;
  background-repeat: no-repeat;
}
</style>
