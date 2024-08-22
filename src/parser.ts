import tokenize from "./tokenizer";
import engine from "./engine";

const { declareConst, declareVariable } = engine()

export function parse(tokens: ReturnType<typeof tokenize>) {
	let i = 0;

	function next() {
		return tokens[i++];
	}

	function parseVariableDeclaration() {
		const keywordToken = next(); // let or const
		const identifierToken = next(); // variable name
		next(); // skip '='
		const valueToken = next(); // the value

		if (keywordToken.type === 'LET') {
			declareVariable(identifierToken.value, parseValue(valueToken));
		} else if (keywordToken.type === 'CONST') {
			declareConst(identifierToken.value, parseValue(valueToken));
		}
	}

	function parseValue(token: typeof tokens[number]) {
		if (token.type === 'NUMBER') return Number(token.value);
		if (token.type === 'STRING') return token.value.slice(1, -1); // Strip quotes
		// Add more cases for other types
	}

	while (i < tokens.length) {
		const token = tokens[i];
		if (token.type === 'LET' || token.type === 'CONST') {
			parseVariableDeclaration();
		} else {
			i++; // Skip over tokens we don't handle yet
		}
	}
}