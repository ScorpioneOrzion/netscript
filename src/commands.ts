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


export default () => {
	const machine: Machine = {
		memory: {},
		dStack: 1,
		eStack: 0,
		cpmVal: false,
		get dataStack() {
			let stack = this.memory[this.dStack];
			if (stack === undefined) {
				this.memory[this.dStack] = [];
			}
			return this.memory[this.dStack];
		},
		get exeStack() {
			let stack = this.memory[this.eStack];
			if (stack === undefined) {
				this.memory[this.eStack] = [];
			}
			return this.memory[this.eStack];
		}
	};

	const commandTable: Record<number, CommandEntry> = {
		0: {
			name: 'PUSH',
			execute() {
				const a = machine.exeStack.pop();
				machine.dataStack.push(a)
			},
		},
		1: {
			name: 'POP',
			execute() {
				machine.dataStack.pop()
			},
		},
		10: {
			name: 'ADD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a + b)
				else throw new Error("Invalid Arguments")
			}
		},
		11: {
			name: 'SUB',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a - b);
				else throw new Error("Invalid Arguments")
			}
		},
		12: {
			name: 'MUL',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a * b);
				else throw new Error("Invalid Arguments")
			}
		},
		13: {
			name: 'DIV',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.dataStack.push(a / b);
				else throw new Error("Invalid Arguments")
			}
		},
		14: {
			name: 'MOD',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b)) machine.dataStack.push(a % b);
				else throw new Error("Invalid Arguments");
			}
		},
		20: {
			name: 'COPY',
			execute() {
				const a = machine.dataStack.pop();
				const b = machine.dataStack.pop();
				if (isPropertyKey(a) && isPropertyKey(b)) {
					const old = machine.memory[a].map(value => value)
					old.every(value => machine.memory[b].push(value))
				} else throw new Error("Invalid Arguments")
			}
		},
		21: {
			name: 'SELECT',
			execute() {
				const a = machine.dataStack.pop();
				const b = machine.dataStack.pop();
				if (isPropertyKey(a) && isNumber(b)) {
					machine.dataStack.push(machine.memory[a][b])
				} else throw new Error("Invalid Arguments")
			}
		},
		22: {
			name: 'CLEAR',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a)) {
					delete machine.memory[a]
				} else throw new Error("Invalid Arguments")
			}
		},
		40: {
			name: 'CMP_EQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a === b);
			}
		},
		41: {
			name: 'CMP_NEQ',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				machine.cpmVal = (a !== b);
			}
		},
		42: {
			name: 'CMP_L',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a < b);
				else throw new Error("Invalid Arguments")
			}
		},
		43: {
			name: 'CMP_LE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a <= b);
				else throw new Error("Invalid Arguments")
			}
		},
		44: {
			name: 'CMP_G',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a > b);
				else throw new Error("Invalid Arguments")
			}
		},
		45: {
			name: 'CMP_GE',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (isNumber(a) && isNumber(b))
					machine.cpmVal = (a >= b);
				else throw new Error("Invalid Arguments")
			}
		},
		46: {
			name: 'IS_TRUE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a)) {
					machine.cpmVal = a;
				}
				else throw new Error("Invalid Arguments")
			}
		},
		47: {
			name: 'IS_FALSE',
			execute() {
				const a = machine.dataStack.pop();
				if (isBoolean(a)) {
					machine.cpmVal = !a;
				}
				else throw new Error("Invalid Arguments")
			}
		},
		48: {
			name: 'GET_CMP',
			execute() {
				machine.dataStack.push(machine.cpmVal)
			}
		},
		110: {
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
		111: {
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
		60: {
			name: 'AND',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (typeof a === 'boolean' && typeof b === 'boolean')
					machine.dataStack.push(a && b);
				else throw new Error("Invalid Arguments");
			}
		},
		61: {
			name: 'OR',
			execute() {
				const b = machine.dataStack.pop();
				const a = machine.dataStack.pop();
				if (typeof a === 'boolean' && typeof b === 'boolean')
					machine.dataStack.push(a || b);
				else throw new Error("Invalid Arguments");
			}
		},
		62: {
			name: 'NOT',
			execute() {
				const a = machine.dataStack.pop();
				if (typeof a === 'boolean')
					machine.dataStack.push(!a);
				else throw new Error("Invalid Arguments");
			}
		},
		100: {
			name: 'CH_EXE',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a)) {
					machine.eStack = a;
				}
			}
		},
		101: {
			name: 'CH_DATA',
			execute() {
				const a = machine.dataStack.pop();
				if (isPropertyKey(a)) {
					machine.dStack = a;
				}
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
			this.machine.exeStack.push(...codes)
			this.execute()
		}
	};
};