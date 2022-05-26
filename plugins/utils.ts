import type { PluginObject } from "vuepress";
import type * as MarkdownIt from "markdown-it";
import type * as Token from "markdown-it/lib/token";
import type { RenderRule } from "markdown-it/lib/renderer";

export function definePluginObject(pluginObject: PluginObject) {
  return pluginObject;
}

/**
 * Transform original code content to HTML.
 * @returns 若返回 `string`，则代表渲染结果；若返回 `null`，则以 `defaultFn` 渲染
 */
export type PartialRule = (ctx: {
  /** 代码内容 */
  content: string;
  /** 代码语言 (c,cpp...) */
  lang: string;
  /** 代码属性 (codemo(...)) */
  attr: string;
  /** MDI Token AST，可与 `defaultFn` 配合使用 */
  token: Token;
  /** 调用内置渲染函数。对 token 的更改会被应用 */
  defaultFn: () => string; 
}) => string | null;

/**
 *
 * @param mdi
 * @param info
 * @param rule @see PartialRule
 */
export function addFenceRule(
  mdi: MarkdownIt,
  info: string | ((lang: string, attr: string) => boolean),
  rule: PartialRule
) {
  const proxy: RenderRule = (tokens, idx, options, env, self) =>
    self.renderToken(tokens, idx, options);
  const defaultFn = mdi.renderer.rules.fence ?? proxy;
  mdi.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const [lang, ...others] = token.info.split(" ");
    const attr = others.join(" ");
    if (typeof info === "function" ? info(lang, attr) : info === lang) {
      const result = rule({
        content: token.content,
        lang,
        attr,
        token,
        defaultFn: () => defaultFn(tokens, idx, options, env, slf),
      });
      if (result !== null) {
        return result;
      }
    }
    return defaultFn(tokens, idx, options, env, slf);
  };
}
