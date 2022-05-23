<!--
 Copyright (c) 2022 Guyutongxue
 
 This Source Code Form is subject to the terms of the Mozilla Public
 License, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { tokenize } from "./tokenizer";
import { diffLines } from "diff";
import { emitter } from "./emitter";

const code = ref("");

const lineIds = ref([] as number[]);
let nextLineId = 0;

const focusedLines = ref([] as number[]);

onMounted(() => {
  const howManyLines = code.value.split(/\r?\n/).length;
  for (let i = 0; i < howManyLines; i++) {
    lineIds.value.push(nextLineId++);
  }
  emitter.on("change", (newCode) => {
    const changes = diffLines(code.value, newCode, { ignoreWhitespace: true });
    console.log(changes);
    let oldLineNo = 0;
    const newLines: number[] = [];
    focusedLines.value = [];
    for (const ch of changes) {
      const count = ch.count ?? 1;
      if (ch.added) {
        for (let i = 0; i < count; i++) {
          newLines.push(nextLineId++);
          focusedLines.value.push(newLines.length - 1);
        }
      } else if (ch.removed) {
        oldLineNo += count;
      } else {
        for (let i = 0; i < count; i++) {
          newLines.push(lineIds.value[oldLineNo++]);
        }
      }
    }
    console.log(newLines);
    lineIds.value = newLines;
    code.value = newCode;
    nextTick().then(async () => {
      await new Promise((r) => setTimeout(r, 1000));
      document.querySelector(".focus-line")?.scrollIntoView();
    });
  })
});


// Tokenize code, return lines of tokens with id
const tokens = computed(() => {
  const tokens = tokenize(code.value, "cpp");
  const hasFocus = focusedLines.value.length > 0;
  return lineIds.value.map((id, i) => {
    return {
      id,
      focus: !hasFocus || focusedLines.value.includes(i),
      tokens: tokens[i],
    };
  });
});
</script>

<template>
  <div
    class="language-plain line-numbers-mode"
    style="display: flex; flex-direction: row"
  >
    <div class="line-numbers">
      <div v-for="() in tokens" class="line-number"></div>
    </div>
    <TransitionGroup name="code" tag="div" class="code-group">
      <div
        v-for="line of tokens"
        :key="line.id"
        class="code-line"
        :class="!line.focus && 'opacity-70'"
      >
        <span
          v-for="({ content, type }, index) of line.tokens"
          :key="index"
          :class="['token', ...type]"
          >{{ content }}</span
        >
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.code-group {
  flex-grow: 1;
  overflow-x: hidden;
  color: #fff; /* Need to be configurable */
  margin-left: var(--code-ln-wrapper-width);
  padding-top: 1.25rem;
  padding-left: 1rem;
  background-color: var(--code-bg-color);
  font-size: 0.85em;
}
.code-line {
  white-space: pre;
  font-family: var(--font-family-code);
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transition-delay: 300ms;
  background-color: unset;
  height: 1.4rem;
}
.code-line::after {
  content: " ";
}
.code-line>.token {
  vertical-align: middle;
}

.opacity-70 {
  opacity: 70%;
}

.code-move {
  transition: all 0.5s ease;
  transition-delay: 0.3s;
}
.code-leave-active {
  transition: all 0.5s ease;
  position: absolute;
}
.code-enter-active {
  transition: all 0.5s ease;
  transition-delay: 0.5s;
}

.code-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.code-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
