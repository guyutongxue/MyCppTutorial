<template>
  <div>
    <button title="点击以在左侧显示本节代码" @click="trigger">显示代码</button>
  </div>
</template>

<script setup lang="ts">
import { emitter } from "./emitter";

const props = defineProps<{ code: string }>();

function trigger() {
  emitter.emit("change", props.code);
}
</script>
