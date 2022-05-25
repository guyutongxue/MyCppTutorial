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

type Node =
  | {
      type: "raw";
      value: string;
    }
  | {
      type: "placeholder";
      value: string;
    }
  | {
      type: "group";
      opt: boolean;
      children: Node[];
    };

function buildTree(tokens: Token[]) {}

export function parse(src: string) {
  const tokens = tokenize(src);
  return tokens;
}
