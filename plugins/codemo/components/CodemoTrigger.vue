<template>
  <div @click="trigger" class="codemo-trigger">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="60%"
      height="60%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M4 20v2h4.586L2 28.586L3.414 30L10 23.414V28h2v-8H4zm26-10l-6-6l-1.414 1.414L27.172 10l-4.586 4.586L24 16l6-6zm-16.08 7.484l4.15-15.483l1.932.517l-4.15 15.484zM4 10l6-6l1.414 1.414L6.828 10l4.586 4.586L10 16l-6-6z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { emitter } from "./emitter";

const props = defineProps<{
  lang?: string;
  code: string;
}>();

function trigger() {
  emitter.emit("show", { ...props });
}
</script>
<style>
.codemo-trigger {
  box-shadow: 0 3px 5px -1px #0003, 0 6px 10px #00000024, 0 1px 18px #0000001f;
  background-color: var(--c-brand);
  color: var(--c-bg);
  cursor: pointer;
  transition-property: transform background-color;
  transition-duration: 200ms;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  float: right;
  width: 60px;
  height: 60px;
  margin: 1em;
  margin-right: 0;
}
.codemo-trigger.show {
  position: absolute;
  width: 32px;
  height: 32px;
  top: -16px;
  right: -16px;
  margin: 0;
  z-index: 10;
}
.codemo-trigger:hover {
  background-color: var(--c-brand-light);
}
.codemo-trigger:hover:active {
  transform: scale(0.95);
}
</style>
