import { debounceTime, merge, type Observable, Subject } from "rxjs";

export const focusLines = new Subject<number[]>();

/**
 * 来自正文的 Codemo 触发代码
 */
export const source = new Subject<{
  lang?: string;
  code: string;
  focus?: number[];
  input?: string;
}>();

/**
 * 来自编辑器的代码
 */
export const editorSource = new Subject<{
  lang?: string;
  code: string;
}>();

// debounceTime is same as godbolt.org
// https://github.com/compiler-explorer/compiler-explorer/blob/14ddad03761f98f765418fb7ac4a5ea305915ae0/static/settings.ts#L358
export const mergedSource: Observable<{
  lang?: string;
  code: string;
  input?: string;
}> = merge(source, editorSource.pipe(debounceTime(750)));
