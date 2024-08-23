import { Token } from "./tokenizer";

export default class parser<T> {
	private tokenizer: (code: string) => Token<T>[];
	private tokens: Token<T>[] = [];
	private currentTokenIndex: number = 0;

	constructor(tokenizer: (code: string) => Token<T>[]) {
		this.tokenizer = tokenizer;
	}

	private getCurrentToken(): Token<T> | null {
		return this.tokens[this.currentTokenIndex] || null;
	}

	private consumeToken(): Token<T> | null {
		const token = this.getCurrentToken();
		if (token) {
			this.currentTokenIndex++;
		}
		return token;
	}

	private parseExpression() {
		return this.parseAdditiveExpression();
	}

	private parseAdditiveExpression() {
		let expr = this.parseMultiplicativeExpression();
		return expr;
	}

	private parseMultiplicativeExpression() {
		let expr = this.parsePrimary();
		return expr;
	}

	private parsePrimary() {
		const token = this.consumeToken();
		if (token?.type === 'NUMBER') {
		} else if (token?.type === 'IDENTIFIER') {
		} else if (token?.type === 'SYMBOL' && token.value === '(') {
		} else if (token?.type === 'OPERATOR' && token.value === '-') {
		} else {
		}
	}


	public parse(code: string) {
		this.tokens = this.tokenizer(code);
		this.currentTokenIndex = 0;

		return this.parseExpression();
	}
}