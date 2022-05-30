<!--
"pattern": {
  "regexp": "^(.*?):(\\d+):(\\d*):?\\s+(?:fatal\\s+)?(warning|error):\\s+(.*)$",
  "file": 1,
  "line": 2,
  "column": 3,
  "severity": 4,
  "message": 5
}
-->

<template>
  <div class="compile-view">
    <div class="tab-items">
      <div>
        <button
          :class="compileTab && 'active'"
          @click="() => (compileTab = true)"
        >
          编译
        </button>
        <button
          :class="!compileTab && 'active'"
          @click="() => (compileTab = false)"
        >
          运行
        </button>
      </div>
      <button
        v-if="!compileTab"
        :class="editStdin && 'active'"
        @click="() => (editStdin = !editStdin)"
      >
        编辑输入
      </button>
    </div>
    <!-- Running -->
    <div class="tab-content" v-if="running">
      <div class="hint-container">
        <img
          v-if="running"
          class="hint"
          src="/assets/loading.svg"
          alt="运行中"
        />
      </div>
    </div>
    <!-- Compile -->
    <div class="tab-content" v-else-if="compileTab">
      <pre><span v-for="stdout of result.stdout">{{ stdout.text }}
</span><span v-for="stderr of result.stderr" v-html="replaceColorToHtml(stderr.text)"></span>
</pre>
    </div>
    <!-- Execute Result -->
    <div class="tab-content" v-else>
      <div>
        <textarea
          v-if="editStdin"
          v-model="stdin"
          class="stdin-textarea"
        ></textarea>
        <pre v-else class="stdin">{{ stdin }}</pre>
      </div>
      <pre
        v-if="result.execResult.didExecute"
      ><span v-for="stdout of result.execResult.stdout">{{ stdout.text }}
</span><span v-for="stderr of result.execResult.stderr" class="stderr">{{ stderr.text }}
</span></pre>
      <pre v-else>代码未运行</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { switchMap, tap, type Subscription } from "rxjs";
import { onMounted, onUnmounted, ref } from "vue";
import { mergedSource } from "./emitter";

const compileTab = ref(false);
const editStdin = ref(false);

const stdin = ref("");

type Stdio = {
  text: string;
  tag?: {
    line: number;
    column: number;
    text: string;
  };
};

type CompileResult = {
  code: number;
  stdout: Stdio[];
  stderr: Stdio[];
  execResult:
    | {
        code: number;
        didExecute: false;
      }
    | {
        code: number;
        didExecute: true;
        stdout: Stdio[];
        stderr: Stdio[];
      };
};

const result = ref<CompileResult>({
  code: 0,
  stdout: [],
  stderr: [],
  execResult: {
    code: 0,
    didExecute: false,
  },
});

const running = ref(false);

let subscription: Subscription;
onMounted(() => {
  subscription = mergedSource
    .pipe(
      tap((v) => {
        running.value = true;
        result.value.execResult.didExecute = false;
        typeof v.input !== "undefined" && (stdin.value = v.input);
      }),
      switchMap(({ code, lang }) => {
        const compileRequest = {
          source: code,
          options: {
            // userArguments: "-O3",
            executeParameters: {
              // args: [],
              stdin: stdin.value,
            },
            filters: {
              execute: true,
            },
          },
          lang: lang,
        };
        return fetch("https://godbolt.org/api/compiler/g121/compile", {
          method: "POST",
          body: JSON.stringify(compileRequest),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }).then((r) => r.json());
      })
    )
    .subscribe((response: CompileResult) => {
      running.value = true;
      result.value.execResult.didExecute = false;
      result.value = response;
      compileTab.value = result.value.code !== 0;
      running.value = false;
    });
});

onUnmounted(() => {
  subscription?.unsubscribe();
});

function replaceColorToHtml(content: string): string {
  content = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // reset color
  return (
    content
      .replace(/\x1b\[K/g, "")
      .replace(/\x1b\[0?m/g, `</span>`)
      // diag text
      .replace(/\x1b\[0?1m/g, `<span class="fw-bold">`)
      // error
      .replace(/\x1b\[0;?1;31m/g, `<span class="fw-bold text-danger">`)
      // warning
      .replace(/\x1b\[0;?1;35m/g, `<span class="fw-bold text-warning">`)
      // note, path
      .replace(/\x1b\[0;?1;36m/g, `<span class="fw-bold text-note">`)
      // range1 (green)
      .replace(/\x1b\[0;?1;32m/g, `<span class="fw-bold text-range1">`)
      // range2 (blue)
      .replace(/\x1b\[0;?1;34m/g, `<span class="fw-bold text-range2">`)
      // fixit-insert
      .replace(/\x1b\[32m/g, `<span class="text-green">`)
      // fixit-delete
      .replace(/\x1b\[31m/g, `<span class="text-red">`) + "\n"
  );
}
</script>

<style lang="scss">
.compile-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.compile-view .tab-items {
  padding: 0 0.5em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  button {
    border: none;
    border-bottom: 1px solid var(--c-border);
    background: transparent;
    color: var(--c-text);
    padding: 5px 0.5rem;
    margin: 0 5px;
    cursor: pointer;
  }
  button.active {
    border-bottom: 2px solid var(--c-brand);
    color: var(--c-brand);
    cursor: default;
  }
  button:hover:not(.active) {
    border-bottom: 1px solid var(--c-text-accent);
  }
}
.compile-view .tab-content {
  flex-grow: 1;
  overflow: auto;
  background-color: var(--c-bg-light);

  pre {
    font-size: 0.85em;
    margin: 0;
    padding: 1em;
    font-family: var(--font-family-code);

    .text-red,
    .text-danger {
      color: #dc3545;
    }
    .text-green {
      color: #198754;
    }

    .text-warning {
      color: #fd7e14;
    }

    .text-note {
      color: #0d6efd;
    }

    .text-range1 {
      color: #20c997;
    }

    .text-range2 {
      color: #0dcaf0;
    }

    .fw-bold {
      font-weight: bold;
    }
  }
  .stderr {
    color: red;
  }
  .stdin {
    color: #7ec699;
    padding-bottom: 0;
  }

  .hint-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .hint {
      font-size: 1.5em;
      color: var(--c-text-lighter);
    }
  }
}
.stdin-textarea {
  width: 100%;
  border: 0px;
  padding: 0px;
}
</style>
