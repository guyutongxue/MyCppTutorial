enum TokenType {
  PLACEHOLDER,
  OR,
  LPAREN,
  RPAREN,
  LBRACKET,
  RBRACKET,
  LBRACE,
  RBRACE,
  STRING,
  WHITESPACE,
}

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(src: string) {
  const possibleTokens = [
    {
      type: TokenType.STRING,
      regex: /^"[^"\\]*(\\.[^"\\]*)*"/,
    },
    {
      type: TokenType.OR,
      regex: /^\|/,
    },
    {
      type: TokenType.LPAREN,
      regex: /^\(/,
    },
    {
      type: TokenType.RPAREN,
      regex: /^\)/,
    },
    {
      type: TokenType.LBRACKET,
      regex: /^\[/,
    },
    {
      type: TokenType.RBRACKET,
      regex: /^\]/,
    },
    {
      type: TokenType.LBRACE,
      regex: /^\{/,
    },
    {
      type: TokenType.RBRACE,
      regex: /^\}/,
    },
    {
      type: TokenType.WHITESPACE,
      regex: /^\s+/,
    },
    {
      type: TokenType.PLACEHOLDER,
      regex: /^[^"|()[\]{}"]+/,
    },
  ];
  const tokens = [];
  while (src !== "") {
    let found = false;
    for (const token of possibleTokens) {
      const match = token.regex.exec(src);
      if (match) {
        tokens.push({
          type: token.type,
          value: match[0],
        });
        src = src.substring(match[0].length);
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Could not tokenize ${src}`);
    }
  }
  return tokens;
}

export type Node =
  | {
      type: "raw";
      value: string;
    }
  | {
      type: "or";
    }
  | {
      type: "placeholder";
      value: string;
    }
  | {
      type: "group";
      children: Node[];
    }
  | {
      type: "opt";
      children: Node[];
    }
  | {
      type: "repeat";
      children: Node[];
    };

function buildTree(tokens: Token[], groupType?: "group" | "opt" | "repeat") {
  const nodes: Node[] = [];
  // 推入 raw 节点，必要时合并
  function pushRaw(value: string) {
    const lastNode = nodes[nodes.length - 1];
    if (lastNode && lastNode.type === "raw") {
      lastNode.value += value;
    } else {
      nodes.push({
        type: "raw",
        value,
      });
    }
  }
  while (true) {
    const token = tokens.shift();
    if (typeof token === "undefined") break;
    switch (token.type) {
      case TokenType.RPAREN: {
        if (groupType === "group") return nodes;
        throw new Error(`Unexpected ')' in group(${groupType})`);
      }
      case TokenType.RBRACKET: {
        if (groupType === "opt") return nodes;
        throw new Error(`Unexpected ']' in group(${groupType})`);
      }
      case TokenType.RBRACE: {
        if (groupType === "repeat") return nodes;
        throw new Error(`Unexpected '}' in group(${groupType})`);
      }
      case TokenType.LPAREN: {
        const children = buildTree(tokens, "group");
        nodes.push({
          type: "group",
          children,
        });
        break;
      }
      case TokenType.LBRACKET: {
        const children = buildTree(tokens, "opt");
        nodes.push({
          type: "opt",
          children,
        });
        break;
      }
      case TokenType.LBRACE: {
        const children = buildTree(tokens, "repeat");
        nodes.push({
          type: "repeat",
          children,
        });
        break;
      }
      case TokenType.STRING: {
        pushRaw(token.value.substring(1, token.value.length - 1));
        break;
      }
      case TokenType.WHITESPACE: {
        pushRaw(token.value);
        break;
      }
      case TokenType.PLACEHOLDER: {
        nodes.push({
          type: "placeholder",
          value: token.value,
        });
        break;
      }
      case TokenType.OR: {
        nodes.push({
          type: "or",
        });
        break;
      }
    }
  }
  if (typeof groupType === "undefined") return nodes;
  else throw new Error("Expected ')', ']' or '}'");
}

export function parse(src: string) {
  const tokens = tokenize(src);
  const nodes = buildTree(tokens);
  return nodes;
}
