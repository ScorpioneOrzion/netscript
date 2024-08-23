type Token<T> = {
	type: T
	value: string
}

const tokenTypes = [
	{ regex: /^\s+/, type: 'WHITESPACE' }, // Ignore whitespace
	{ regex: /^let\b/, type: 'LET' },
	{ regex: /^const\b/, type: 'CONST' },
	{ regex: /^function\b/, type: 'FUNCTION' },
	{ regex: /^[a-zA-Z_]\w*/, type: 'IDENTIFIER' }, // Variable or function names
	{ regex: /^(?:[<>]=?|==|!=|===|!==)/, type: 'COMPARISON' },
	{ regex: /^\*\*|[\^+*/-]/, type: 'OPERATOR' },
	{ regex: /^=/, type: 'ASSIGN' },
	{ regex: /^[\d]+/, type: 'NUMBER' }, // Numbers
	{ regex: /^"[^"]*"|^'[^']*'/, type: 'STRING' }, // Strings
	{ regex: /^[;{}(),]/, type: 'SYMBOL' }, // Symbols and delimiters
] as const

type TokenType = Exclude<typeof tokenTypes[number]["type"], "WHITESPACE">;

function tokenize(code: string) {
	const tokens: Token<TokenType>[] = [];

	tokenLoop: while (code.length > 0) {
		for (let i = 0; i < tokenTypes.length; i++) {
			const { regex, type } = tokenTypes[i];
			const match = code.match(regex);

			if (match) {
				if (type !== 'WHITESPACE') {
					tokens.push({ type, value: match[0] });
				}
				code = code.slice(match[0].length);
				continue tokenLoop;
			}
		}

		throw new Error(`Unexpected token: ${code[0]}`);
	}

	return tokens;
}

type Expression = number | string | BinaryExpression | UnaryExpression;

class BinaryExpression {
	constructor(public left: Expression, public operator: string, public right: Expression) { }
}

class UnaryExpression {
	constructor(public operator: string, public operand: Expression) { }
}

class NumberLiteral {
	constructor(public value: number) { }
}

class Variable {
	constructor(public name: string) { }
}

export default class Parser {
	private tokens: ReturnType<typeof this.tokenizer> = [];
	private currentTokenIndex: number = 0;

	constructor(private tokenizer: typeof tokenize) { }

	public parse(code: string) {
		this.tokens = this.tokenizer(code);
		this.currentTokenIndex = 0;

		return
	}
}