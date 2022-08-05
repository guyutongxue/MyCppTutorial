import { addFenceRule, definePluginObject } from "../utils";
import { JSDOM, type DOMWindow } from "jsdom";
import indexes from "@gytx/cppreference-index/dist/generated.json";
import type { Index } from "@gytx/cppreference-index";
import { path } from "@vuepress/utils";

interface LinkEntry {
  begin: number;
  end: number;
  link: string;
}

type Token = { content: string; classList: Set<string> };

/**
 * 将 DOM 树拍平
 * @return 每个叶子 <span> 的类列表和内容
 */
function flatten(parent: Element, window: DOMWindow) {
  const result: Token[] = [];
  for (const n of parent.childNodes) {
    if (n instanceof window.Text) {
      const ele = parent.cloneNode() as Element;
      result.push({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        content: n.textContent!,
        classList: new Set(ele.classList),
      });
    } else if (n instanceof window.Element) {
      n.classList.add(...parent.classList);
      result.push(...flatten(n, window));
    }
  }
  return result;
}

/** 将拍平后的 <span> 和链接合并，组成元素 */
function tokensToElement(
  tokens: Token[],
  links: LinkEntry[],
  document: Document
) {
  const anchors = links
    .flatMap((l) => [
      {
        type: "begin" as const,
        index: l.begin,
        link: l.link,
      },
      {
        type: "end" as const,
        index: l.end,
      },
    ])
    .sort((a, b) => a.index - b.index);
  let currentIndex = 0;
  const result: Array<
    | {
        type: "begin";
        link: string;
      }
    | {
        type: "end";
      }
    | {
        type: "content";
        classList: Set<string>;
        content: string;
      }
  > = [];
  while (tokens.length && anchors.length) {
    const { index } = anchors[0];
    const { classList, content } = tokens[0];
    if (index < currentIndex + content.length) {
      if (index !== currentIndex) {
        result.push({
          type: "content",
          content: content.substring(0, index - currentIndex),
          classList,
        });
        tokens[0].content = content.substring(index - currentIndex);
      }
      result.push(anchors[0]);
      anchors.shift();
      currentIndex = index;
    } else {
      result.push({
        type: "content",
        content,
        classList,
      });
      tokens.shift();
      currentIndex += content.length;
    }
  }
  result.push(
    ...tokens.map((t) => ({
      type: "content" as const,
      ...t,
    }))
  );

  // Debugging
  // for (const r of result) {
  //   switch (r.type) {
  //     case "content": process.stdout.write(r.content); break;
  //     case "begin": process.stdout.write(`\x1b[34m(${r.link})\x1b[32m[`); break;
  //     case "end": process.stdout.write(`]\x1b[0m`); break;
  //   }
  // }
  let container: HTMLElement = document.createElement("code");
  for (const r of result) {
    switch (r.type) {
      case "content": {
        const span = document.createElement("span");
        span.classList.add(...r.classList);
        span.textContent = r.content;
        container.appendChild(span);
        break;
      }
      case "begin": {
        const anchor = document.createElement("a");
        anchor.href = `https://zh.cppreference.com/w/${r.link}`;
        anchor.target = "_blank";
        container.appendChild(anchor);
        container = anchor;
        break;
      }
      case "end": {
        if (container.parentElement === null) {
          throw new Error("No parent element");
        }
        container = container.parentElement;
        break;
      }
    }
  }
  return container;
}

function addLink(ele: Element, code: string, window: DOMWindow) {
  // Deep clone
  const searchList: Index<true>[] = indexes.map((s) => ({ ...s }));
  for (const i of code.matchAll(/^using namespace ([\w:]+);$/gm)) {
    searchList
      .filter((s) => s.type === "symbol" && s.name.startsWith(i[1] + "::"))
      .forEach((s) => (s.name = s.name.substring(i[1].length + 2)));
  }
  for (const i of code.matchAll(/^namespace ([\w:]+) = (.+);$/gm)) {
    searchList
      .filter((s) => s.type === "symbol" && s.name.startsWith(i[2] + "::"))
      .forEach((s) => (s.name = i[1] + s.name.substring(i[2].length)));
  }
  const sorted = searchList.sort((a, b) => b.name.length - a.name.length);
  const links: LinkEntry[] = [];
  for (const i of sorted) {
    // https://stackoverflow.com/a/9310752/14053503
    const escaped = i.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    for (const g of code.matchAll(
      new RegExp(`(?<!\\w)${escaped}(?!\\w)`, "g")
    )) {
      if (typeof g.index === "undefined") continue;
      const begin = g.index;
      const end = g.index + i.name.length;
      code =
        code.substring(0, begin) +
        " ".repeat(i.name.length) +
        code.substring(end);
      links.push({
        begin,
        end,
        link: i.link,
      });
    }
  }

  const tokens = flatten(ele, window);
  const root = ele.cloneNode() as Element;
  root.innerHTML = tokensToElement(tokens, links, window.document).innerHTML;
  return root;
}

export const autolinkerPlugin = () =>
  definePluginObject({
    name: "vuepress-plugin-autolinker",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    extendsMarkdown: (mdi, app) => {
      // 为加快开发时运行速度，仅在构建时启用
      if (!app.env.isBuild) return;

      addFenceRule(mdi, "cpp", ({ defaultFn, content }): string => {
        const html = defaultFn();
        const window = new JSDOM(`<!DOCTYPE html>${html}`).window;
        const codeblock = window.document.querySelector(".language-cpp code");
        if (codeblock === null) return html;
        const linked = addLink(codeblock, content, window);
        codeblock.replaceWith(linked);
        return window.document.body.innerHTML;
      });
    },
  });
