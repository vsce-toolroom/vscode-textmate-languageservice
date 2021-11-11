import * as ScopeSelectorParser from "./scope-selector-parser";

export default class ScopeSelector {
	matcher: any;
    /**
     *  Create a new scope selector.
     *  @param {string} source The string to parse as a scope selector.
     *  @return A newly constructed ScopeSelector.
     */
	constructor(source) {
		this.matcher = ScopeSelectorParser.parse(source);
	}
    /**
     *  Check if this scope selector matches the scopes.
     *  @param {string|string[]} scopes A single scope or an array of them to be compared against.
     *  @return {boolean} Whether or not this ScopeSelector matched.
     */
	matches(scopes): boolean {
		if (typeof scopes === "string") {
			scopes = [scopes];
		}
		return this.matcher.matches(scopes);
	}

    /**
     *  Gets the prefix of this scope selector.
     *  @param {string|string[]} scopes The scopes to match a prefix against.
     *  @return {?string} The matching prefix, if there is one.
     */
	getPrefix(scopes): string | undefined {
		if (typeof scopes === "string") {
			scopes = [scopes];
		}
		return this.matcher.getPrefix(scopes);
	}
    /**
     * Convert this TextMate scope selector to a CSS selector.
     *  @return {string} CSSSelector representation of this ScopeSelector.
     */
	toCssSelector(): string {
		return this.matcher.toCssSelector();
	}

    /**
     *  Convert this TextMate scope selector to a CSS selector, prefixing scopes
     *  with `syntax--`.
     *  @return {string} Syntax-specific CSSSelector representation of this
     *  ScopeSelector.
     */
	toCssSyntaxSelector(): string {
		return this.matcher.toCssSyntaxSelector();
	}
};
