<template>
  <div
    class="language-plain line-numbers-mode"
  >
    <div class="line-numbers">
      <div v-for="() in tokens" class="line-number"></div>
    </div>
    <TransitionGroup
      name="code"
      tag="div"
      class="code-group"
      @dblclick="() => (editing = true)"
    >
      <div
        v-for="line of tokens"
        :key="line.id"
        class="code-line"
        :class="line.focus ? 'focus-line' : 'opacity-70'"
      >
        <span
          v-for="({ content, type }, index) of line.tokens"
          :key="index"
          :class="['token', ...type]"
          >{{ content }}</span
        >
      </div>
    </TransitionGroup>
    <div v-if="editing" class="editor-container">
      <Editor :code="code" :lang="lang"></Editor>
      <div class="back-icon" @click="() => (editing = false)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
          width="40px"
          height="40px"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M10 2a1 1 0 0 0-1.79-.614l-7 9a1 1 0 0 0 0 1.228l7 9A1 1 0 0 0 10 20v-3.99c5.379.112 7.963 1.133 9.261 2.243c1.234 1.055 1.46 2.296 1.695 3.596l.061.335a1 1 0 0 0 1.981-.122c.171-2.748-.086-6.73-2.027-10.061C19.087 8.768 15.694 6.282 10 6.022V2Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { tokenize } from "./tokenizer";
import { diffLines } from "diff";
import { source } from "./emitter";
import type { Subscription } from "rxjs";
import Editor from "./Editor.vue";

const code = ref("");
const lang = ref("cpp");

const lineIds = ref([] as number[]);
let nextLineId = 0;

const focusedLines = ref([] as number[]);

let subscription: Subscription;
onMounted(() => {
  const howManyLines = code.value.split(/\r?\n/).length;
  for (let i = 0; i < howManyLines; i++) {
    lineIds.value.push(nextLineId++);
  }
  source.subscribe((n) => {
    const changes = diffLines(code.value, n.code, { ignoreWhitespace: true });
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
    if (n.focus) {
      focusedLines.value = n.focus;
      console.log(n.focus);
    }
    lineIds.value = newLines;
    code.value = n.code;
    lang.value = n.lang ?? "cpp";
    nextTick().then(async () => {
      document.querySelector(".focus-line")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
onUnmounted(() => {
  subscription?.unsubscribe();
});

// Tokenize code, return lines of tokens with id
const tokens = computed(() => {
  const tokens = tokenize(code.value, lang.value);
  const hasFocus = focusedLines.value.length > 0;
  return lineIds.value.map((id, i) => {
    return {
      id,
      focus: !hasFocus || focusedLines.value.includes(i),
      tokens: tokens[i],
    };
  });
});

const editing = ref(false);
</script>

<style>
.code-group {
  flex-grow: 1;
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
.code-line > .token {
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

.editor-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 5px; /* Or strange overflow... */
  z-index: 10;
}
.editor-container .CodeMirror pre.CodeMirror-line,
.editor-container .CodeMirror pre.CodeMirror-line-like {
  margin-left: unset;
  padding-left: unset;
  vertical-align: unset;
}
.back-icon {
  position: absolute;
  right: 1em;
  bottom: 1em;
  color: var(--c-brand);
  cursor: pointer;
}
</style>
