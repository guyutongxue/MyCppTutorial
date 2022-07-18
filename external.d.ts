// https://github.com/redbug312/markdown-it-multimd-table/issues/47
declare module "markdown-it-multimd-table" {
  import type { MarkdownIt } from "markdown-it";
  interface Options {
    multiline: boolean;
    rowspan: boolean;
    headerless: boolean;
    multibody: boolean;
  }
  export default function multimd_table_plugin(md: MarkdownIt, options?: Partial<Options>): void;
}

declare module "@gytx/cppreference-index/dist/generated.json" {
  import type { Index } from "@gytx/cppreference-index";
  const json: Index<true>[];
  export default json;
}
