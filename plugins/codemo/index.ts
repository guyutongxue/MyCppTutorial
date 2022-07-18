import { path } from "@vuepress/utils";
import { escapeHtml } from "markdown-it/lib/common/utils";
import { definePluginObject, addFenceRule, type RuleContext } from "../utils";

function parseCodemoArgs(args: string) {
  const lParen = args.indexOf("(");
  const rParen = args.indexOf(")");
  let focus: number[] = [];
  let input: string | undefined = "";
  if (lParen > 0 && rParen > lParen) {
    args
      .substring(lParen + 1, rParen)
      .split(",")
      .map(
        (s) => s.split("=").map((s) => s.trim()) as [string, string | undefined]
      )
      .forEach(([key, value]) => {
        if (key === "focus") {
          if (typeof value === "undefined") {
            throw new Error(
              `Expect argument for "focus" param but nothing found`
            );
          }
          focus = value.split("/").flatMap((part) => {
            const dash = part.indexOf("-");
            const lines = [];
            if (dash > 0) {
              const start = parseInt(part.substring(0, dash));
              const end = parseInt(part.substring(dash + 1));
              if (start < 0 || end < start) {
                throw new Error(`invalid focus: ${part}`);
              }
              for (let i = start; i <= end; i++) {
                lines.push(i);
              }
            } else {
              const line = parseInt(part);
              if (line < 0) {
                throw new Error(`invalid focus: ${part}`);
              }
              lines.push(line);
            }
            return lines;
          });
        } else if (key === "input") {
          if (typeof value === "undefined") {
            input = value;
          } else {
            // TODO: Need more precise escaping
            input = value
              .replace(/_/g, " ")
              .replace(/;/g, ",")
              .replace(/\\,/g, ";")
              .replace(/\\n/g, "\n")
              .replace(/\\ /g, "_")
              .replace(/\\,/g, ",")
              .replace(/\\\\/g, "\\");
          }
        }
      });
  }
  return { focus, input };
}

function toPropString(props: [string, string | undefined][]) {
  return props
    .map(([name, value]) =>
      value ? `${escapeHtml(name)}="${escapeHtml(value)}"` : ""
    )
    .join(" ");
}

function codemoRule({ content, lang, attr, token, defaultFn }: RuleContext) {
  const { input } = parseCodemoArgs(attr);
  const lines = content.trim().split("\n");
  const codemoDirective = /^\s*\/\/\s+(codemo\b.*)$/;
  let hide: boolean | null = null;
  const parsed = lines.map((line) => {
    const result = line.match(codemoDirective);
    if (result !== null) {
      const directive = result[1].trim().split(" ")[1];
      hide ?? (hide = directive === "show");
      return {
        type: "directive" as const,
        value: directive,
      };
    } else {
      return {
        type: "content" as const,
        value: line,
      };
    }
  });
  hide ?? (hide = false);
  const shownContent: string[] = [];
  const shownFocus: number[] = [];
  const fullContent: string[] = [];
  const fullFocus: number[] = [];
  for (const i of parsed) {
    if (i.type === "directive") {
      switch (i.value) {
        case "hide":
          hide = true;
          break;
        case "show":
          hide = false;
          break;
        case "focus-next-line": {
          shownFocus.push(shownContent.length + 1);
          fullFocus.push(fullContent.length);
          break;
        }
      }
    } else if (i.type === "content") {
      if (!hide) {
        shownContent.push(i.value);
      }
      fullContent.push(i.value);
    }
  }
  token.content = shownContent.join("\n") + "\n";
  token.info = `${lang} {${shownFocus.join(",")}}`;
  const rendered = defaultFn();

  const props = toPropString([
    ["lang", lang],
    ["code", fullContent.join("\n")],
    ["focus", fullFocus.length > 0 ? fullFocus.join(",") : void 0],
    ["input", input],
  ]);
  return `<div style="position: relative">${rendered}<CodemoTrigger title="显示代码" ${props} /></div>`;
}

export const codemoPlugin = () => {
  return definePluginObject({
    name: "vuepress-plugin-codemo",
    clientConfigFile: path.resolve(__dirname, "./client.ts"),
    onInitialized: (app) => {
      app.layouts["Layout"] = path.resolve(
        __dirname,
        "./components/CodemoLayout.vue"
      );
    },
    extendsMarkdown: (mdi) => {
      addFenceRule(
        mdi,
        (lang, attr) =>
          ["c", "cpp"].includes(lang) && attr.startsWith("codemo"),
        codemoRule
      );
    },
  });
};
