// Copyright (c) 2022 Guyutongxue
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Original from https://github.com/pomber/code-surfer/blob/master/packs/step-parser/src/tokenizer.ts

import Prism from "prismjs";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-c.js";
import "prismjs/components/prism-cpp.js";

const newlineRe = /\r?\n/;

export function tokenize(code: string, lang: string) {
  const grammar = Prism.languages[lang];
  if (!grammar) {
    throw new MissingGrammarError(lang);
  }

  const prismTokens = Prism.tokenize(code, Prism.languages[lang]);
  const nestedTokens = tokenizeStrings(prismTokens);
  const tokens = flattenTokens(nestedTokens);

  let currentLine: FlatToken[] = [];
  let currentTokenLine: string[] = [];
  let currentTypeLine: string[][] = [];

  const lines = [currentLine];
  const tokenLines = [currentTokenLine];
  const typeLines = [currentTypeLine];

  tokens.forEach((token) => {
    const contentLines = token.content.split(newlineRe);

    const firstContent = contentLines.shift();
    if (firstContent !== undefined && firstContent !== "") {
      currentLine.push({ type: token.type, content: firstContent });
      currentTokenLine.push(firstContent);
      currentTypeLine.push(token.type);
    }
    contentLines.forEach((content) => {
      currentLine = [];
      currentTokenLine = [];
      currentTypeLine = [];
      lines.push(currentLine);
      tokenLines.push(currentTokenLine);
      typeLines.push(currentTypeLine);
      if (content !== "") {
        currentLine.push({ type: token.type, content });
        currentTokenLine.push(content);
        currentTypeLine.push(token.type);
      }
    });
  });
  return lines;
}

type NestedToken = {
  type: string[];
  content: string | NestedToken[];
};

function tokenizeStrings(
  prismTokens: (string | Prism.Token)[],
  parentType: string[] = []
): NestedToken[] {
  return prismTokens.map((prismToken) => wrapToken(prismToken, parentType));
}

function wrapToken(
  prismToken: string | Prism.Token,
  parentType: string[] = []
): NestedToken {
  if (typeof prismToken === "string") {
    return {
      type: parentType,
      content: prismToken,
    };
  }

  const types = [...parentType, prismToken.type];
  if (prismToken.alias) {
    if (Array.isArray(prismToken.alias)) {
      types.push(...prismToken.alias);
    } else {
      types.push(prismToken.alias);
    }
  }
  if (Array.isArray(prismToken.content)) {
    return {
      type: types,
      content: tokenizeStrings(prismToken.content, types),
    };
  }

  return wrapToken(prismToken.content, types);
}

type FlatToken = {
  type: string[];
  content: string;
};

// Take a list of nested tokens
// (token.content may contain an array of tokens)
// and flatten it so content is always a string
// and type the type of the leaf
function flattenTokens(tokens: NestedToken[]) {
  const flatList: FlatToken[] = [];
  tokens.forEach((token) => {
    const { type, content } = token;
    if (Array.isArray(content)) {
      flatList.push(...flattenTokens(content));
    } else {
      flatList.push({ type: type, content });
    }
  });
  return flatList;
}

export class MissingGrammarError extends Error {
  lang: string;
  constructor(lang: string) {
    super(`Missing syntax highlighting for language "${lang}"`);
    this.lang = lang;
  }
}
