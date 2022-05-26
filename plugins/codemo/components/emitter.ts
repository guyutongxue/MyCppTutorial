import { debounceTime, merge, Subject } from "rxjs";

export const source = new Subject<{
  lang?: string;
  code: string;
}>();

export const editorSource = new Subject<{
  lang?: string;
  code: string;
}>();

// debounceTime is same as godbolt.org
// https://github.com/compiler-explorer/compiler-explorer/blob/14ddad03761f98f765418fb7ac4a5ea305915ae0/static/settings.ts#L358
export const mergedSource = merge(source, editorSource.pipe(debounceTime(750)));
