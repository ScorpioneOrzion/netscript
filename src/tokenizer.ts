export type Token<T> = {
	type: T
	value: string
}

export default function tokenize(code: string) {
	const tokenTypes = [
		{ regex: /^\s+/, type: 'WHITESPACE' }, // Ignore whitespace
		{ regex: /^let\b/, type: 'LET' },
		{ regex: /^const\b/, type: 'CONST' },
		{ regex: /^function\b/, type: 'FUNCTION' },
		{ regex: /^[a-zA-Z_]\w*/, type: 'IDENTIFIER' }, // Variable or function names
		{ regex: /^=/, type: 'ASSIGN' },
		{ regex: /^[\d]+/, type: 'NUMBER' }, // Numbers
		{ regex: /^"[^"]*"|^'[^']*'/, type: 'STRING' }, // Strings
		{ regex: /^[;{}(),]/, type: 'SYMBOL' }, // Symbols and delimiters
	] as const

	type TokenType = Exclude<typeof tokenTypes[number]["type"], "WHITESPACE">;

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