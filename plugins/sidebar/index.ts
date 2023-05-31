import { definePluginObject } from "../utils";
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "yaml";
import type {
  PluginObject,
  SidebarConfig,
  SidebarGroup,
} from "vuepress";

export interface SidebarPluginOptions {
  sourceDir: string;
}

type SidebarRawItem =
  | {
      link: string;
      text?: string;
      children?: SidebarRaw;
    }
  | {
      [link: `/${string}`]: SidebarRaw; // 假设总是以 / 开头，此时若 link 不存在于 SidebarRawItem 内时，可以收紧类型到这里
    }
  | string;
type SidebarRaw = SidebarRawItem[];

type ResolvedSidebarItem = {
  link: string;
  text: string;
  children?: ResolvedSidebar;
};
type ResolvedSidebar = ResolvedSidebarItem[];

function itemToDefaultTheme(item: ResolvedSidebarItem): SidebarGroup {
  const { link, text, children } = item;
  return {
    text: text ?? link,
    link: link,
    children: children?.map(itemToDefaultTheme) ?? [],
  };
}

export class Sidebar {
  sourceDir: string;
  sidebar: ResolvedSidebar;
  pn: Record<string, { prev?: string; next?: string }> = {};

  constructor(options: SidebarPluginOptions) {
    this.sourceDir = options.sourceDir;
    const sidebarFile = fs.readFileSync(
      path.resolve(options.sourceDir, "sidebar.yml"),
      "utf8"
    );
    const sidebar = yaml.parse(sidebarFile);
    this.sidebar = this.#transformSidebar(sidebar);
    this.#genPrevNext();
  }

  #getTitle(link: string) {
    let filepath;
    if (link.endsWith(".md")) {
      filepath = path.join(this.sourceDir, link);
    } else if (link.endsWith("/")) {
      filepath = path.join(this.sourceDir, link, "README.md");
    } else {
      throw new Error(`Invalid link: ${link}`);
    }
    const file = fs.readFileSync(filepath, "utf8");
    const match = file.match(/^# (.*)$/m);
    return match?.[1].replace(/<Badge [^/]*?text="(.*?)" \/>/g, (_, a) => `(${a})`) ?? link;
  }

  #transformSidebar(raw: SidebarRaw) {
    const result: ResolvedSidebar = [];
    for (const item of raw) {
      if (typeof item === "string") {
        result.push({
          link: item,
          text: this.#getTitle(item),
        });
      } else if (typeof item === "object") {
        if ("link" in item) {
          const { link, text, children } = item;
          result.push({
            link,
            text: text ?? this.#getTitle(link),
            children: this.#transformSidebar(children ?? []),
          });
        } else {
          const [link, children] = Object.entries(item)[0];
          result.push({
            link: link,
            text: this.#getTitle(link),
            children: this.#transformSidebar(children),
          });
        }
      }
    }
    return result;
  }

  #genPrevNext() {
    function flatten(list: ResolvedSidebar) {
      const result: string[] = [];
      for (const item of list) {
        result.push(item.link);
        if (item.children) {
          result.push(...flatten(item.children));
        }
      }
      return result;
    }
    const flatLinks = flatten(this.sidebar);
    for (let i = 0; i < flatLinks.length; i++) {
      this.pn[flatLinks[i]] = {
        prev: flatLinks[i - 1],
        next: flatLinks[i + 1],
      };
    }
  }

  forPlugin(): PluginObject {
    return definePluginObject({
      name: "vuepress-plugin-sidebar",
      onInitialized: (app) => {
        const configuredSrcDir = path.resolve(this.sourceDir);
        const appSrcDir = path.resolve(app.dir.source());
        if (configuredSrcDir !== appSrcDir) {
          throw new Error(
            `Sidebar plugin: sourceDir mismatch. Expected ${configuredSrcDir}, got ${appSrcDir}.`
          );
        }
      },
      extendsPage: (page) => {
        const path = page.path.replace(/\.html$/, ".md");
        const { prev, next } = this.pn[path] ?? {};
        page.frontmatter["prev"] = prev;
        page.frontmatter["next"] = next;
      },
    });
  }

  forVueDefaultTheme(): SidebarConfig {
    const result: SidebarGroup[] = [];
    for (const item of this.sidebar) {
      result.push({
        text: item.text ?? item.link,
        link: item.link,
        collapsible: true,
        children: item.children?.map(itemToDefaultTheme) ?? [],
      });
    }
    return result;
  }
}
