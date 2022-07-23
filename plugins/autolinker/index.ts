import { addFenceRule, definePluginObject } from "../utils";
import { JSDOM, type DOMWindow } from "jsdom";
import indexes from "@gytx/cppreference-index/dist/generated.json";
import type { Index } from "@gytx/cppreference-index";
import { escapeHtml } from "markdown-it/lib/common/utils";
import { path } from "@vuepress/utils";

interface LinkEntry {
  begin: number;
  end: number;
  link: string;
}
interface TraverseContext {
  currentIndex: number;
  parent: Element;
  links: LinkEntry[];
  window: DOMWindow;
  // debug: boolean;
}

function traverse(node: Node, ctx: TraverseContext) {
  const first: LinkEntry | undefined = ctx.links[0];
  const firstBegin = (first?.begin ?? Infinity) - ctx.currentIndex;
  const firstEnd = (first?.end ?? Infinity) - ctx.currentIndex;
  if (node instanceof ctx.window.Text) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const text = node.textContent!;
    const len = text.length;
    // if (ctx.debug) console.log({ c: ctx.currentIndex, len, firstBegin, firstEnd });
    if (firstBegin >= len) {
      ctx.parent.append(node.cloneNode());
    } else if (firstBegin < 0) {
      if (firstEnd > len) {
        ctx.parent.append(node.cloneNode());
      } else {
        const secondPart = text.substring(0, firstEnd);
        ctx.parent.append(secondPart);
        const closingElements: Element[] = [];
        while (ctx.parent.tagName.toLowerCase() !== "a") {
          closingElements.push(ctx.parent);
          const pe = ctx.parent.parentElement;
          if (pe === null)
            throw new Error(`Unexpected back-traced to root element`);
          ctx.parent = pe;
        }
        ctx.parent = ctx.parent.parentElement!;
        // if (ctx.debug) console.log(ctx.parent.innerHTML);
        while (closingElements.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const last = closingElements.pop()!.cloneNode() as Element;
          last.innerHTML = "";
          ctx.parent.append(last);
          ctx.parent = last;
        }
        ctx.links.shift();
      }
    } else {
      const firstPart = text.substring(0, firstBegin);
      if (firstPart) {
        ctx.parent.append(firstPart);
      }
      const secondPart = text.substring(firstBegin, firstEnd);
      const linkEle = ctx.window.document.createElement("a");
      linkEle.href = `https://zh.cppreference.com/w/${first!.link}`;
      linkEle.target = "_blank";
      linkEle.innerHTML = escapeHtml(secondPart);
      ctx.parent.append(linkEle);
      if (firstEnd > len) {
        ctx.parent = linkEle;
      } else {
        ctx.links.shift();
      }
    }
    ctx.currentIndex += Math.min(firstEnd, len);
    if (firstEnd < len) {
      const remainder = text.substring(firstEnd);
      traverse(ctx.window.document.createTextNode(remainder), ctx);
    }
  } else if (node instanceof ctx.window.Element) {
    if (node.tagName.toLowerCase() === "a") {
      throw new Error(`<a> is not allowed`);
    }
    const parent = ctx.parent;
    const currentNode = node.cloneNode() as Element;
    currentNode.innerHTML = "";
    ctx.parent = currentNode;
    parent.append(currentNode);
    for (const c of node.childNodes) {
      traverse(c, ctx);
    }
    ctx.parent = ctx.parent.parentElement!;
  } else {
    throw new Error(`Unrecognized node type: ${node.nodeType}`);
  }
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
  const root = ele.cloneNode() as Element;
  root.innerHTML = "";


  traverse(ele, {
    currentIndex: 0,
    parent: root,
    links: links.sort((a, b) => a.begin - b.begin),
    window,
  });
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
