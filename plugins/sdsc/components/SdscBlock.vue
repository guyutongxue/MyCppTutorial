<template>
  <pre><SdscNode v-for="node of nodes" :node="node" /></pre>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Node } from "../parser";
import SdscNode from "./SdscNode.vue";

const props = defineProps<{
  nodesJson: string
}>();

const nodes = computed(() => {
  return JSON.parse(props.nodesJson) as Node[];
});

const temp = computed(() => JSON.stringify(nodes.value, undefined, 2));

</script>

<style>
.sdsc-inline {
  color: rgb(var(--sdsc-color));
}
.sdsc-inline .string {
  color: var(--c-text-lighter);
}
</style>
