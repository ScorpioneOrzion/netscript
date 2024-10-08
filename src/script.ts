type CommandEntry = {
	name: string;
	execute: () => void;
};

type Machine = {
	memory: { [key: PropertyKey]: unknown[] }
	dStack: PropertyKey
	eStack: PropertyKey
	cpmVal: boolean
	dataStack: unknown[]
	exeStack: unknown[]
}

function isPropertyKey(key: unknown): key is PropertyKey {
	return isString(key) || isNumber(key) || isSymbol(key)
}
function isNumber(key: unknown): key is number {
	return typeof key === "number"
}
function isString(key: unknown): key is string {
	return typeof key === "string"
}
function isSymbol(key: unknown): key is symbol {
	return typeof key === "symbol"
}
function isBoolean(key: unknown): key is boolean {
	return typeof key === "boolean"
}
function isObject(key: unknown): key is object {
	return typeof key === "object"
}

function shuffleArray(array: number[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export default () => {
	const machine: Machine = {
		memory: {},
		dStack: 1,
		eStack: 0,
		cpmVal: false,
		get dataStack() {
			let stack = this.memory[this.dStack];
			if (stack === undefined)
				this.memory[this.dStack] = [];
			return this.memory[this.dStack];
		},
		get exeStack() {
			let stack = this.memory[this.eStack];
			if (stack === undefined)
				this.memory[this.eStack] = [];
			return this.memory[this.eStack];
		}
	}

	const commands: CommandEntry[] = [
		{
			name: 'PUSH',
			execute() {
				const a = machine.exeStack.pop();
				machine.dataStack.push(a)
			},
		},
		{
			name: 'POP',
			execute() {
				machine.dataStack.pop()
			},
		},
		{
			name: 'ADD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a + b)
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'SUB',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a - b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'MUL',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a * b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'DIV',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a / b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'MOD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a % b);
				else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'COPY',
			execute() {
				const a = machine.dataStack.pop();
				const b = machine.dataStack.pop();
				if (isPropertyKey(a) && isPropertyKey(b)) {
					const old = machine.memory[a].map(value => value)
					if (!(b in machine.memory)) machine.memory[b] = []
					old.forEach(value => machine.memory[b].push(value))
				} else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'SELECT',
			execute() {
				const a = machine.dataStack.pop();
				const b = machine.dataStack.pop();
				if (isPropertyKey(a) && isNumber(b)) {
					if (b in machine.memory[a])
						machine.dataStack.push(machine.memory[a][b])
					else machine.dataStack.push(undefined)
				} else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'CLEAR',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a))
					delete machine.memory[a]
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'GET_INDEX_COUNT',
			execute() {
				const location = machine.dataStack.pop();
				if (isPropertyKey(location)) {
					if (location in machine.memory)
						machine.dataStack.push(machine.memory[location].length);
					else machine.dataStack.push(0)
				} else {
					throw new Error("Invalid Arguments");
				}
			}
		},
		{
			name: 'CMP_EQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a === b);
			}
		},
		{
			name: 'CMP_NEQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a !== b);
			}
		},
		{
			name: 'CMP_L',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a < b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'CMP_LE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a <= b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'CMP_G',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a > b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'CMP_GE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a >= b);
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'IS_TRUE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a))
					machine.cpmVal = a;
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'IS_FALSE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a))
					machine.cpmVal = !a;
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'GET_CMP',
			execute() {
				machine.dataStack.push(machine.cpmVal)
			}
		},
		{
			name: 'SKIP_IF_TRUE',
			execute() {
				const a = machine.dataStack.pop();
				if (machine.cpmVal) {
					if (isNumber(a)) for (let i = 0; i < a; i++)
						machine.exeStack.pop();
					else throw new Error("Invalid Arguments")
				}
			}
		},
		{
			name: 'SKIP_IF_FALSE',
			execute() {
				const a = machine.dataStack.pop();
				if (!machine.cpmVal) {
					if (isNumber(a)) for (let i = 0; i < a; i++)
						machine.exeStack.pop();
					else throw new Error("Invalid Arguments")
				}
			}
		},
		{
			name: 'SKIP',
			execute() {
				const a = machine.dataStack.pop();
				if (isNumber(a)) for (let i = 0; i < a; i++)
					machine.exeStack.pop();
				else throw new Error("Invalid Arguments")
			}
		},
		{
			name: 'AND',
			execute() {
				const b = machine.dataStack.pop()
				const a = machine.dataStack.pop()
				if (isBoolean(a) && isBoolean(b))
					machine.dataStack.push(a && b);
				else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'OR',
			execute() {
				const b = machine.dataStack.pop()
				const a = machine.dataStack.pop()
				if (isBoolean(a) && isBoolean(b))
					machine.dataStack.push(a || b);
				else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'NOT',
			execute() {
				const a = machine.dataStack.pop()
				if (isBoolean(a))
					machine.dataStack.push(!a);
				else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'CH_EXE',
			execute() {
				const a = machine.dataStack.pop()
				if (isPropertyKey(a))
					machine.eStack = a;
			}
		},
		{
			name: 'CH_DATA',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a))
					machine.dStack = a;
			}
		},
		{
			name: 'GET_TYPE',
			execute() {
				const topElement = machine.dataStack.pop();
				const type = typeof topElement;
				machine.dataStack.push(type);
			}
		},
		{
			name: 'REMOVE_PROPERTY',
			execute() {
				const key = machine.dataStack.pop();
				const obj = machine.dataStack.pop();
				if (isObject(obj) && !Array.isArray(obj) && obj !== null) {
					if (isPropertyKey(key) && key in obj)
						delete obj[key as keyof typeof obj]
					machine.dataStack.push(obj);
				} else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'ADD_PROPERTY',
			execute() {
				const value = machine.dataStack.pop();
				const key = machine.dataStack.pop();
				const obj = machine.dataStack.pop();
				if (isObject(obj) && !Array.isArray(obj) && obj !== null && isPropertyKey(key))
					machine.dataStack.push(Object.assign(obj, { [key]: value }));
				else throw new Error("Invalid Arguments");
			}
		},
		{
			name: 'GET_PROPERTY',
			execute() {
				const key = machine.dataStack.pop()
				const obj = machine.dataStack[machine.dataStack.length - 1]
				if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null && isPropertyKey(key)) {
					if (key in obj) machine.dataStack.push(obj[key as keyof typeof obj])
					else machine.dataStack.push(undefined)
				} else throw new Error(`Invalid Arguments`);
			}
		},
		{
			name: 'CREATE_OBJ',
			execute() {
				machine.dataStack.push({})
			}
		},
		{
			name: 'SAVE',
			execute() {
				const fileName = machine.dataStack.pop()
				const fileData = machine.dataStack.pop()
			}
		},
		{
			name: 'LOAD',
			execute() {
				const fileName = machine.dataStack.pop()
			}
		},
		{
			name: 'CHANGE_DIRECTORY',
			execute() { }
		},
		{
			name: 'CONNECT',
			execute() { }
		},
		{
			name: 'SCAN',
			execute() { }
		},
	]

	let index = Array.from({ length: Math.min(commands.length * 1.5, 2147483647) | 0 }, (_, i) => i);
	shuffleArray(index);
	let i = 0;

	const commandTable = Object.fromEntries(commands.map(item => [index[i++], item]))

	return {
		machine,
		commandTable,
		transpile(value: string | number) {
			if (isNumber(value)) return value
			for (const key in commandTable) {
				if (value === key) return +key
				if (value.toUpperCase() === commandTable[key].name.toUpperCase()) return +key
			}
			return -1
		},
		execute() {
			try {
				while (machine.exeStack.length > 0) {
					const command = machine.exeStack.pop();

					let commandCode: number;

					if (isNumber(command)) {
						commandCode = command;
					} else if (isString(command)) {
						commandCode = this.transpile(command);
					} else {
						throw new Error('Invalid Command');
					}

					if (commandCode !== -1 && commandCode in commandTable) {
						commandTable[commandCode].execute();
					} else {
						throw new Error('Invalid Command');
					}
				}
			} catch (error) {
				if (error instanceof Error) console.error('Execution halted due to error:', error.message);
				else console.error('Execution halted due to error:', error)
				machine.exeStack.length = 0;
			}
		},
		executeCode(...codes: unknown[]) {
			const old = codes.map(value => {
				const number = Number(value);
				return isNaN(number) ? value : number;
			}).reverse()
			old.forEach(code => this.machine.exeStack.push(code))
			this.execute()
		}
	};
};