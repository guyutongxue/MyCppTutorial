<template>
  <ParentLayout>
    <template #page>
      <Home v-if="frontmatter.home" />
      <template v-else>
        <Transition
          name="fade-slide-y"
          mode="out-in"
          @before-enter="onBeforeEnter"
          @before-leave="onBeforeLeave"
        >
          <Page
            :key="page.path"
            class="page"
            :style="{
              paddingRight: `calc(${
                codemoWidth / 100
              } * (100vw - var(--active-sidebar-width)))`,
            }"
          >
            <template #top>
              <slot name="page-top" />
            </template>
            <template #bottom>
              <slot name="page-bottom" />
            </template>
          </Page>
        </Transition>
        <Splitpanes
          vertical
          class="codemo-panes"
          @resize="codemoWidth = $event[1].size"
        >
          <Pane :min-size="20" :size="100 - codemoWidth"> </Pane>
          <Pane :size="codemoWidth">
            <CodemoPanel class="codemo-panel" />
          </Pane>
        </Splitpanes>
      </template>
    </template>
  </ParentLayout>
</template>

<script setup lang="ts">
// @ts-ignore
import Home from "@theme/Home.vue";
// @ts-ignore
import Page from "@theme/Page.vue";
import ParentLayout from "@vuepress/theme-default/lib/client/layouts/Layout.vue";
import type { DefaultThemePageFrontmatter } from "@vuepress/theme-default/lib/shared";
// @ts-ignore
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { useScrollPromise } from "@vuepress/theme-default/lib/client/composables";
import { usePageData, usePageFrontmatter } from "@vuepress/client";
import { onMounted, onUnmounted, ref } from "vue";
import CodemoPanel from "./CodemoPanel.vue";

import { source } from "./emitter";
import type { Subscription } from "rxjs";

const page = usePageData();
const frontmatter = usePageFrontmatter<DefaultThemePageFrontmatter>();

// handle scrollBehavior with transition
const scrollPromise = useScrollPromise();
const onBeforeEnter = scrollPromise.resolve;
const onBeforeLeave = scrollPromise.pending;

const codemoWidth = ref(0);

let subscription: Subscription;

onMounted(() => {
  subscription = source.subscribe(() => {
    if (codemoWidth.value < 10) {
      codemoWidth.value = 40;
    }
  });
});

onUnmounted(() => {
  subscription?.unsubscribe();
});
</script>

<style>
@media (max-width: 719px) {
  :root {
    --active-sidebar-width: 0;
  }
}
@media (min-width: 719px) and (max-width: 959px) {
  :root {
    --active-sidebar-width: var(--sidebar-width-mobile);
  }
}
@media (min-width: 959px) {
  :root {
    --active-sidebar-width: var(--sidebar-width);
  }
}
body {
  overflow-y: scroll;
}

.codemo-panes {
  position: fixed;
  top: var(--navbar-height);
  left: var(--active-sidebar-width);
  bottom: 0;
  right: 0;
  width: unset;
  pointer-events: none;
}
.splitpanes__pane {
  overflow: auto;
}
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 6px;
  background: var(--c-border);
  pointer-events: auto;
}
.codemo-panel {
  height: calc(100vh - var(--navbar-height));
  pointer-events: auto;
}
</style>
