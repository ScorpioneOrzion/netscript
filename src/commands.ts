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

	let index = Array.from({ length: 1000 }, (_, i) => i);
	shuffleArray(index);
	let i = 0;

	const commandTable: Record<number, CommandEntry> = {
		[index[i++]]: {
			name: 'PUSH',
			execute() {
				const a = machine.exeStack.pop();
				machine.dataStack.push(a)
			},
		},
		[index[i++]]: {
			name: 'POP',
			execute() {
				machine.dataStack.pop()
			},
		},
		[index[i++]]: {
			name: 'ADD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a + b)
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'SUB',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a - b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'MUL',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a * b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'DIV',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a / b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'MOD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a % b);
				else throw new Error("Invalid Arguments");
			}
		},
		[index[i++]]: {
			name: 'COPY',
			execute() {
				const a = machine.dataStack.pop();
				const b = machine.dataStack.pop();
				if (isPropertyKey(a) && isPropertyKey(b)) {
					const old = machine.memory[a].map(value => value)
					old.forEach(value => machine.memory[b].push(value))
				} else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
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
		[index[i++]]: {
			name: 'CLEAR',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a))
					delete machine.memory[a]
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'CMP_EQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a === b);
			}
		},
		[index[i++]]: {
			name: 'CMP_NEQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a !== b);
			}
		},
		[index[i++]]: {
			name: 'CMP_L',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a < b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'CMP_LE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a <= b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'CMP_G',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a > b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'CMP_GE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a >= b);
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'IS_TRUE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a))
					machine.cpmVal = a;
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'IS_FALSE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a))
					machine.cpmVal = !a;
				else throw new Error("Invalid Arguments")
			}
		},
		[index[i++]]: {
			name: 'GET_CMP',
			execute() {
				machine.dataStack.push(machine.cpmVal)
			}
		},
		[index[i++]]: {
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
		[index[i++]]: {
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
		[index[i++]]: {
			name: 'AND',
			execute() {
				const b = machine.dataStack.pop()
				const a = machine.dataStack.pop()
				if (isBoolean(a) && isBoolean(b))
					machine.dataStack.push(a && b);
				else throw new Error("Invalid Arguments");
			}
		},
		[index[i++]]: {
			name: 'OR',
			execute() {
				const b = machine.dataStack.pop()
				const a = machine.dataStack.pop()
				if (isBoolean(a) && isBoolean(b))
					machine.dataStack.push(a || b);
				else throw new Error("Invalid Arguments");
			}
		},
		[index[i++]]: {
			name: 'NOT',
			execute() {
				const a = machine.dataStack.pop()
				if (isBoolean(a))
					machine.dataStack.push(!a);
				else throw new Error("Invalid Arguments");
			}
		},
		[index[i++]]: {
			name: 'CH_EXE',
			execute() {
				const a = machine.dataStack.pop()
				if (isPropertyKey(a))
					machine.eStack = a;
			}
		},
		[index[i++]]: {
			name: 'CH_DATA',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a))
					machine.dStack = a;
			}
		},
		[index[i++]]: {
			name: 'GET_TYPE',
			execute() {
				const topElement = machine.dataStack.pop();
				const type = typeof topElement;
				machine.dataStack.push(type);
			}
		},
		[index[i++]]: {
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
		[index[i++]]: {
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
		[index[i++]]: {
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
		[index[i++]]: {
			name: 'CREATE_OBJ',
			execute() {
				machine.dataStack.push({})
			}
		}
	}

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
			});
			old.forEach(code => this.machine.exeStack.push(code))
			this.execute()
		}
	};
};