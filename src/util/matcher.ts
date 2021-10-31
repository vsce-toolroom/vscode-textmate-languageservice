export interface MatcherWithPriority<T> {
	matcher: Matcher<T>;
	priority: -1 | 0 | 1;
}

export interface Matcher<T> {
	(matcherInput: T): boolean;
}

export function createMatchers<T>(selector: string, matchesName: (names: string[], matcherInput: T) => boolean): MatcherWithPriority<T>[] {
	const results = <MatcherWithPriority<T>[]>[];
	const tokenizer = newTokenizer(selector);
	let token = tokenizer.next();
	while (token !== null) {
		let priority: -1 | 0 | 1 = 0;
		if (token.length === 2 && token.charAt(1) === ':') {
			switch (token.charAt(0)) {
				case 'R': priority = 1; break;
				case 'L': priority = -1; break;
				default:
					console.log(`Unknown priority ${token} in scope selector`);
			}
			token = tokenizer.next();
		}
		let matcher = parseConjunction();
		results.push({ matcher, priority });
		if (token !== ',') {
			break;
		}
		token = tokenizer.next();
	}
	return results;

	function parseOperand(): Matcher<T> | null {
		if (token === '-') {
			token = tokenizer.next();
			const expressionToNegate = parseOperand();
			return function(matcherInput) {
				return !!expressionToNegate && !expressionToNegate(matcherInput);
			};
		}
		if (token === '(') {
			token = tokenizer.next();
			const expressionInParents = parseInnerExpression();
			if (token === ')') {
				token = tokenizer.next();
			}
			return expressionInParents;
		}
		if (isIdentifier(token)) {
			const identifiers: string[] = [];
			do {
				identifiers.push(token);
				token = tokenizer.next();
			} while (isIdentifier(token));
			return function(matcherInput) {
				return matchesName(identifiers, matcherInput)
			};
		}
		return null;
	}
	function parseConjunction(): Matcher<T> {
		const matchers: Matcher<T>[] = [];
		let matcher = parseOperand();
		while (matcher) {
			matchers.push(matcher);
			matcher = parseOperand();
		}
		return function(matcherInput) {
			return matchers.every(function(matcher) { // and
				return matcher(matcherInput);
			});
		};
	}
	function parseInnerExpression(): Matcher<T> {
		const matchers: Matcher<T>[] = [];
		let matcher = parseConjunction();
		while (matcher) {
			matchers.push(matcher);
			if (token === '|' || token === ',') {
				do {
					token = tokenizer.next();
				} while (token === '|' || token === ','); // ignore subsequent commas
			} else {
				break;
			}
			matcher = parseConjunction();
		}
		return function(matcherInput) {
			return matchers.some(function(matcher) { // or
				return matcher(matcherInput);
			});
		};
	}
}

export function nameMatcher(identifers: string[], stackElements: string[]) {
	let lastIndex = 0;
	return identifers.every(function (identifier) {
		for (let i = lastIndex; i < stackElements.length; i++) {
			if (stackElements[i] === identifier) {
				lastIndex = i + 1;
				return true;
			}
		}
		return false;
	});
};

function isIdentifier(token: string | null): token is string {
	return !!token && !!token.match(/[\w\.:]+/);
}

function newTokenizer(input: string): { next: () => string | null } {
	let regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
	let match = regex.exec(input);
	return {
		next: function() {
			if (!match) {
				return null;
			}
			const res = match[0];
			match = regex.exec(input);
			return res;
		}
	};
}
