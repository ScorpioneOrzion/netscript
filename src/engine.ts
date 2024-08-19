
// Define primitive types
export type Primitive = number | string | boolean;

// Define an object with primitive values or other PrimitiveObjects
export type PrimitiveObject = { [key: string]: Primitive | PrimitiveObject; };

// Define the target object type with optional parent scope
export type ScopeObject = PrimitiveObject & defaultObject;

const PARENT_SCOPE_SYMBOL = Symbol("parentScope");
const CONSTANT_SYMBOL = Symbol("constant")
const VARIABLE_SYMBOL = Symbol("variable")
// Proxy handler for scopes
const scopeHandler: ProxyHandler<ScopeObject> = {
	get(target, prop: string, receiver) {
		if (prop in target) {
			return target[prop];
		}
		if (target[PARENT_SCOPE_SYMBOL]) {
			return Reflect.get(target[PARENT_SCOPE_SYMBOL], prop, receiver);
		}
		throw new Error(`Variable '${prop}' is not defined in the current scope.`);
	},
	set(target, prop: string, value) {
		target[prop] = value;
		return true;
	},
	deleteProperty() {
		return false
	}
};

// Proxy handler for Objects
const objectHandler: ProxyHandler<PrimitiveObject> = {
	get(target, prop: string, _reciever) {
		if (prop === 'constructor') {
			return target[prop];
		}
		if (prop in target) {
			const value = target[prop];
			if (typeof value === 'object' && value !== null) {
				return new Proxy(value, objectHandler);
			}
			return value;
		}
		throw new Error(`Property '${prop}' is not defined in the current scope.`);
	},
	set(target, prop: string, value) {
		if (typeof value === 'object' && value !== null) {
			value = new Proxy(value, objectHandler);
		}
		target[prop] = value;
		return true;
	},
	deleteProperty(target, prop: string) {
		return delete target[prop];
	}
};

type defaultObject = {
	[PARENT_SCOPE_SYMBOL]?: ScopeObject
	[CONSTANT_SYMBOL]: Set<string>
	[VARIABLE_SYMBOL]: Set<string>
}

function defaultObject(): ScopeObject {
	return {
		[CONSTANT_SYMBOL]: new Set(),
		[VARIABLE_SYMBOL]: new Set()
	}
}

// Initialize scope stack with global scope
const scopeStack = [new Proxy(defaultObject(), scopeHandler)];

// Enter a new scope
function enterScope() {
	const parentScope = scopeStack[scopeStack.length - 1];
	const newScope = new Proxy(Object.assign(defaultObject(), { [PARENT_SCOPE_SYMBOL]: parentScope }), scopeHandler);
	scopeStack.push(newScope);
}

// Exit the current scope
function exitScope() {
	if (scopeStack.length === 1) throw new Error(`Cannot exit the global scope.`);
	scopeStack.pop();
}

// Declare a variable in the current scope
function declareVariable(varName: string, value: Primitive | PrimitiveObject) {
	const currentScope = scopeStack[scopeStack.length - 1];
	if (currentScope[CONSTANT_SYMBOL].has(varName)) {
		throw new Error(`Can't redefine constant '${varName}'`);
	}
	currentScope[VARIABLE_SYMBOL].add(varName)
	SetValue(currentScope, varName, value)
}

// Declare a const in the current scope
function declareConst(varName: string, value: Primitive | PrimitiveObject) {
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

function SetValue(currentScope: ScopeObject, varName: string, value: Primitive | PrimitiveObject) {
	if (typeof value === "object") {
		currentScope[varName] = new Proxy(value, objectHandler);
	} else {
		currentScope[varName] = value;
	}
}

// Get a variable from the current scope
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
		getVariable
	};
};
