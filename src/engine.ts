// Declare types
export type Primitive = number | string | boolean;
export type ObjectType = {
	[key: string]: Primitive | ObjectType | FunctionType | undefined
	[TYPE_SCOPE]: typeof OBJECT_TYPE
}
export type FunctionType = {
	func: () => Primitive | ObjectType | FunctionType | undefined
	argNames: string[]
	[TYPE_SCOPE]: typeof FUNCTION_TYPE
}
export type ScopeType = {
	[key: string]: Primitive | ObjectType | FunctionType | undefined
	[PARENT_SCOPE_SYMBOL]?: ScopeType
	[CONSTANT_SYMBOL]: Set<string>
	[VARIABLE_SYMBOL]: Set<string>
	[TYPE_SCOPE]: typeof SCOPE_TYPE
}
type ChildScopeType = ScopeType & {
	[PARENT_SCOPE_SYMBOL]: ScopeType
}

// Declare consts
const PARENT_SCOPE_SYMBOL = Symbol("parentScope");
const CONSTANT_SYMBOL = Symbol("constant");
const VARIABLE_SYMBOL = Symbol("variable");
const FUNCTION_TYPE = Symbol("function");
const OBJECT_TYPE = Symbol("object");
const SCOPE_TYPE = Symbol("scope");
const TYPE_SCOPE = Symbol("type_scope");
const reservedKeywords = new Set(['function', 'const', 'let', 'undefined']);
function defaultObject(): ScopeType {
	return {
		[CONSTANT_SYMBOL]: new Set(),
		[VARIABLE_SYMBOL]: new Set(),
		[TYPE_SCOPE]: SCOPE_TYPE,
	};
}

const scopeStack = [defaultObject()]

function enterScope() {
	const parentScope = scopeStack[scopeStack.length - 1];
	const newScope = Object.assign(defaultObject(), { [PARENT_SCOPE_SYMBOL]: parentScope });
	scopeStack.push(newScope);
}

function exitScope() {
	if (scopeStack.length === 1) throw new Error(`Cannot exit the global scope.`);
	scopeStack.pop();
}

function declareVariable(varName: string, value: FunctionType | Primitive | ObjectType | undefined) {
	const currentScope = scopeStack[scopeStack.length - 1];
	if (reservedKeywords.has(varName))
		throw new Error(`Cannot redefine reserved keyword '${varName}'.`);
	if (currentScope[CONSTANT_SYMBOL].has(varName))
		throw new Error(`Can't redefine constant '${varName}'`);

	currentScope[VARIABLE_SYMBOL].add(varName)
	SetValue(currentScope, varName, value)
}

function declareConst(varName: string, value: FunctionType | Primitive | ObjectType | undefined) {
	const currentScope = scopeStack[scopeStack.length - 1];
	if (reservedKeywords.has(varName))
		throw new Error(`Cannot redefine reserved keyword '${varName}'.`);
	if (currentScope[CONSTANT_SYMBOL].has(varName)) {
		throw new Error(`Can't redefine constant '${varName}'`);
	}
	if (currentScope[VARIABLE_SYMBOL].has(varName)) {
		throw new Error(`Can't reuse variable name '${varName}'`);
	}
	currentScope[CONSTANT_SYMBOL].add(varName)
	SetValue(currentScope, varName, value)
}

function SetValue(currentScope: ScopeType, varName: string, value: FunctionType | ObjectType | Primitive | undefined) {
	currentScope[varName] = value
}

function hasParent(scope: ScopeType): scope is ChildScopeType {
	return PARENT_SCOPE_SYMBOL in scope
}

function executeFunction(fn: FunctionType, args: (FunctionType | ObjectType | Primitive | undefined)[]) {
	enterScope()
	for (let i = 0; i < fn.argNames.length; i++) {
		declareVariable(fn.argNames[i], args[i]);
	}
	const result = fn.func()
	exitScope();
	return result;
}

function declareProperty(object: ObjectType, varName: string, value: FunctionType | Primitive | ObjectType | undefined) {
	if (reservedKeywords.has(varName))
		throw new Error(`Cannot redefine reserved keyword '${varName}'.`);

	object[varName] = value
}

function deleteProperty(object: ObjectType, propName: string) {
	if (propName in object) return delete object[propName]
	return false
}

function getProperty(object: ObjectType, propName: string) {
	if (propName in object) return object[propName]
	throw new Error(`Property '${propName}' is not defined.`);
}

function getVariable(varName: string) {
	let currentScope = scopeStack[scopeStack.length - 1]
	while (true) {
		if (varName in currentScope) return currentScope[varName];
		if (hasParent(currentScope))
			currentScope = currentScope[PARENT_SCOPE_SYMBOL]
		else
			throw new Error(`Variable '${varName}' is not defined in the current scope.`);
	}
}

export default () => {
	return {
		scopeStack,
		enterScope,
		exitScope,

		declareVariable,
		declareConst,
		getVariable,

		executeFunction,

		declareProperty,
		deleteProperty,
		getProperty
	};
};