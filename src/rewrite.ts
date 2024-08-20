// Declare types
export type Primitive = NumberType<number> | StringType<string> | BooleanType<boolean>;
type NumberType<T extends number> = {
	value: T
	[TYPE_SCOPE]: typeof PRIMITIVE_TYPE
	[METHODS_SYMBOL]: {
		[key: string]: unknown
	}
}
type StringType<T extends string> = {
	value: T
	[TYPE_SCOPE]: typeof PRIMITIVE_TYPE
	[METHODS_SYMBOL]: {
		[key: string]: unknown
	}
}
type BooleanType<T extends boolean> = {
	value: T
	[TYPE_SCOPE]: typeof PRIMITIVE_TYPE
	[METHODS_SYMBOL]: {
		[key: string]: unknown
	}
}
export type ObjectType = {
	[key: string]: Primitive | ObjectType | FunctionType<any, any>
	[TYPE_SCOPE]: typeof OBJECT_TYPE
}
export type FunctionType<T, R> = {
	func: (args: T[]) => R
	argNames: string[]
	[TYPE_SCOPE]: typeof FUNCTION_TYPE
}
export type ScopeType = {
	[key: string]: Primitive | ObjectType | FunctionType<any, any>
	[PARENT_SCOPE_SYMBOL]?: ScopeType
	[CONSTANT_SYMBOL]: Set<string>
	[VARIABLE_SYMBOL]: Set<string>
	[TYPE_SCOPE]: typeof SCOPE_TYPE
}

// Declare consts
const METHODS_SYMBOL = Symbol("methods")
const PARENT_SCOPE_SYMBOL = Symbol("parentScope");
const CONSTANT_SYMBOL = Symbol("constant");
const VARIABLE_SYMBOL = Symbol("variable");
const PRIMITIVE_TYPE = Symbol("primitive");
const FUNCTION_TYPE = Symbol("function");
const OBJECT_TYPE = Symbol("object");
const SCOPE_TYPE = Symbol("scope");
const TYPE_SCOPE = Symbol("type_scope");
const reservedKeywords = new Set(['function', 'const', 'let']);
function defaultObject(): ScopeType {
	return {
		[CONSTANT_SYMBOL]: new Set(),
		[VARIABLE_SYMBOL]: new Set(),
		[TYPE_SCOPE]: SCOPE_TYPE,
	};
}

const typeHandler: ProxyHandler<FunctionType<any, any> | ObjectType | ScopeType | Primitive> = {
	get(target, prop, reciever) {
		if (typeof prop === "symbol")
			throw new Error("No access to symbol properties");
		else switch (target[TYPE_SCOPE]) {
			case OBJECT_TYPE:
				if (prop in target)
					return target[prop]
				throw new Error(`Property '${prop}' is not defined in the current scope.`);
			case SCOPE_TYPE:
				if (prop in target)
					if (target[prop][TYPE_SCOPE] === FUNCTION_TYPE)
						return target[prop].func
					else return target[prop]
				if (target[PARENT_SCOPE_SYMBOL])
					return Reflect.get(target[PARENT_SCOPE_SYMBOL], prop, reciever);
				throw new Error(`Variable '${prop}' is not defined in the current scope.`);
			case FUNCTION_TYPE:
				throw new Error("No access");
			case PRIMITIVE_TYPE:
				if (prop in target[METHODS_SYMBOL]) {
					return target[METHODS_SYMBOL][prop]
				}
				if (prop === 'value') {
					return target.value;
				}
				throw new Error(`Property '${prop}' is not available on primitive type.`);
			default:
				throw new Error("Unexpected type");
		}
	},
	set(target, prop, value) {
		if (typeof prop === "symbol")
			throw new Error("No access to symbol properties");
		else switch (target[TYPE_SCOPE]) {
			case OBJECT_TYPE:
				if (typeof value === 'object' && value !== null) {
					target[prop] = new Proxy(value, typeNoScopeHandler);
					return true
				}
				return false
			case SCOPE_TYPE:
				if (reservedKeywords.has(prop))
					throw new Error(`Cannot redefine reserved keyword '${prop}'.`);
				if (typeof value === 'object' && value !== null) {
					target[prop] = new Proxy(value, typeNoScopeHandler);
					return true
				}
				return false
			case FUNCTION_TYPE:
				return false
			case PRIMITIVE_TYPE:
				throw new Error("Cannot set properties on primitive types.");
			default:
				throw new Error("Unexpected type");
		}
	},
	has(target, prop) {
		if (typeof prop === "symbol")
			throw new Error("No access to symbol properties");
		else switch (target[TYPE_SCOPE]) {
			case OBJECT_TYPE:
			case SCOPE_TYPE:
				return prop in target;
			case FUNCTION_TYPE:
			case PRIMITIVE_TYPE:
				return false;
			default:
				throw new Error("Unexpected type");
		}
	},
	deleteProperty(target, prop) {
		if (typeof prop === "symbol")
			throw new Error("No access to symbol properties");
		else switch (target[TYPE_SCOPE]) {
			case OBJECT_TYPE:
				return delete target[prop];
			case SCOPE_TYPE:
			case FUNCTION_TYPE:
			case PRIMITIVE_TYPE:
				return false;
			default:
				throw new Error("Unexpected type in ProxyHandler.");
		}
	}
}
const typeNoScopeHandler = typeHandler as ProxyHandler<FunctionType<any, any> | ObjectType | Primitive>
const typeScopeHandler = typeHandler as ProxyHandler<ScopeType>

const scopeStack = [new Proxy(defaultObject(), typeScopeHandler)]

function enterScope() {
	const parentScope = scopeStack[scopeStack.length - 1];
	const newScope = new Proxy(Object.assign(defaultObject(), { [PARENT_SCOPE_SYMBOL]: parentScope }), typeScopeHandler);
	scopeStack.push(newScope);
}

function exitScope() {
	if (scopeStack.length === 1) throw new Error(`Cannot exit the global scope.`);
	scopeStack.pop();
}

function declareVariable(varName: string, value: Primitive | ObjectType) {
	const currentScope = scopeStack[scopeStack.length - 1];
	if (currentScope[CONSTANT_SYMBOL].has(varName)) {
		throw new Error(`Can't redefine constant '${varName}'`);
	}
	currentScope[VARIABLE_SYMBOL].add(varName)
	SetValue(currentScope, varName, value)
}

function declareConst(varName: string, value: Primitive | ObjectType) {
	const currentScope = scopeStack[scopeStack.length - 1];
	if (currentScope[CONSTANT_SYMBOL].has(varName)) {
		throw new Error(`Can't redefine constant '${varName}'`);
	}
	if (currentScope[VARIABLE_SYMBOL].has(varName)) {
		throw new Error(`Can't reuse variable name '${varName}'`);
	}
	currentScope[CONSTANT_SYMBOL].add(varName)
	SetValue(currentScope, varName, value)
}

// function (...args: any[]) {
// 	enterScope()
// 	const funcScope = scopeStack[scopeStack.length - 1];
// 	for (let i = 0; i < args.length; i++) {
// 		funcScope[functionArguments[i]] = args[i];
// 	}
// 	const result = func();
// 	exitScope()
// 	return result
// }

function declareVariableFunction<T, R>(funcName: string, func: FunctionType<T, R>) {
	const currentScope = scopeStack[scopeStack.length - 1]
	if (currentScope[CONSTANT_SYMBOL].has(funcName)) {
		throw new Error(`Can't redefine constant '${funcName}'`);
	}
	currentScope[VARIABLE_SYMBOL].add(funcName);

	SetValue(currentScope, funcName, func)
}

function declareConstFunction<T, R>(funcName: string, func: FunctionType<T, R>) {
	const currentScope = scopeStack[scopeStack.length - 1]
	if (currentScope[CONSTANT_SYMBOL].has(funcName)) {
		throw new Error(`Can't redefine constant '${funcName}'`);
	}
	if (currentScope[VARIABLE_SYMBOL].has(funcName)) {
		throw new Error(`Can't reuse variable name '${funcName}'`);
	}
	currentScope[CONSTANT_SYMBOL].add(funcName)

	SetValue(currentScope, funcName, func)
}

function SetValue(currentScope: ScopeType, varName: string, value: FunctionType<any, any> | ObjectType | Primitive) {
	currentScope[varName] = new Proxy(value, typeNoScopeHandler)
}

function getVariable(varName: string) {
	const currentScope = scopeStack[scopeStack.length - 1];
	return currentScope[varName];
}

export default () => {
	return {
		scopeStack,
		enterScope,
		exitScope,
		declareVariable,
		declareConst,
		declareVariableFunction,
		declareConstFunction,
		getVariable
	};
};