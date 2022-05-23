<template>
  <div @click="trigger" class="codemo-trigger" title="点击以在右侧代码栏显示">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { emitter } from "./emitter";

const props = defineProps<{
  lang?: string,
  code: string
}>();

function trigger() {
  emitter.emit("show", { ...props });
}
</script>
<style>
.codemo-trigger {
  background-color: var(--c-border);
  cursor: pointer;
  transition-property: transform background-color;
  transition-duration: 200ms;
}
.codemo-trigger:hover {
  background-color: var(--c-border-dark);
}
.codemo-trigger:hover:active {
  transform: scale(0.95);
}
</style>
