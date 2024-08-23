type Expression = EqualityExpression
type EqualityExpression = [AdditiveExpression, ["COMPARISON", AdditiveExpression][]]
type AdditiveExpression = [MultiplicativeExpression, ["+" | "-", MultiplicativeExpression][]]
type MultiplicativeExpression = [PowerExpression, ["*" | "/", PowerExpression][]]
type PowerExpression = [Primary, ["**" | "^", Primary][]]
type Primary = "NUMBER" | "IDENTIFIER" | "STRING" | ["-", Primary] | ["(", Expression, ")"]
type Decleration = ["LET" | "CONST", "IDENTIFIER", "ASSIGN", Expression | FunctionDecleration, "" | ";"]
type FunctionDecleration = ["FUNCTION", "IDENTIFIER", "(", ["IDENTIFIER", [",", "IDENTIFIER"]], ")", "{", Expression[], "}"]