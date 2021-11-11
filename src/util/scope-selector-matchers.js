export class SegmentMatcher {
  constructor(segments) {
    this.segment = segments[0].join('') + segments[1].join('');
  }

  matches(scope) {
    return scope === this.segment;
  }

  getPrefix(scope) {}

  toCssSelector() {
    return this.segment.split('.').map(function(dotFragment) {
      return '.' + dotFragment.replace(/\+/g, '\\+');
    }).join('');
  }

  toCssSyntaxSelector() {
    return this.segment.split('.').map(function(dotFragment) {
      return '.syntax--' + dotFragment.replace(/\+/g, '\\+');
    }).join('');
  }

};

export class TrueMatcher {
  constructor() {}

  matches() {
    return true;
  }

  getPrefix(scopes) {}

  toCssSelector() {
    return '*';
  }

  toCssSyntaxSelector() {
    return '*';
  }

};

export class ScopeMatcher {
  constructor(first, others) {
    var i, len, segment;
    this.segments = [first];
    for (i = 0, len = others.length; i < len; i++) {
      segment = others[i];
      this.segments.push(segment[1]);
    }
  }

  matches(scope) {
    var i, lastDotIndex, len, matcherSegment, matcherSegmentIndex, nextDotIndex, ref, scopeSegment;
    lastDotIndex = 0;
    ref = this.segments;
    for (matcherSegmentIndex = i = 0, len = ref.length; i < len; matcherSegmentIndex = ++i) {
      matcherSegment = ref[matcherSegmentIndex];
      if (lastDotIndex > scope.length) {
        break;
      }
      nextDotIndex = scope.indexOf('.', lastDotIndex);
      if (nextDotIndex === -1) {
        nextDotIndex = scope.length;
      }
      scopeSegment = scope.substring(lastDotIndex, nextDotIndex);
      if (!matcherSegment.matches(scopeSegment)) {
        return false;
      }
      lastDotIndex = nextDotIndex + 1;
    }
    return matcherSegmentIndex === this.segments.length;
  }

  getPrefix(scope) {
    var i, index, len, ref, scopeSegments, segment;
    scopeSegments = scope.split('.');
    if (scopeSegments.length < this.segments.length) {
      return false;
    }
    ref = this.segments;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      segment = ref[index];
      if (segment.matches(scopeSegments[index])) {
        if (segment.prefix != null) {
          return segment.prefix;
        }
      }
    }
  }

  toCssSelector() {
    return this.segments.map(function(matcher) {
      return matcher.toCssSelector();
    }).join('');
  }

  toCssSyntaxSelector() {
    return this.segments.map(function(matcher) {
      return matcher.toCssSyntaxSelector();
    }).join('');
  }

};

export class GroupMatcher {
  constructor(prefix, selector) {
    this.prefix = prefix != null ? prefix[0] : void 0;
    this.selector = selector;
  }

  matches(scopes) {
    return this.selector.matches(scopes);
  }

  getPrefix(scopes) {
    if (this.selector.matches(scopes)) {
      return this.prefix;
    }
  }

  toCssSelector() {
    return this.selector.toCssSelector();
  }

  toCssSyntaxSelector() {
    return this.selector.toCssSyntaxSelector();
  }

};

export class PathMatcher {
  constructor(prefix, first, others) {
    var i, len, matcher;
    this.prefix = prefix != null ? prefix[0] : void 0;
    this.matchers = [first];
    for (i = 0, len = others.length; i < len; i++) {
      matcher = others[i];
      this.matchers.push(matcher[1]);
    }
  }

  matches(scopes) {
    var i, index, len, matcher, scope;
    index = 0;
    matcher = this.matchers[index];
    for (i = 0, len = scopes.length; i < len; i++) {
      scope = scopes[i];
      if (matcher.matches(scope)) {
        matcher = this.matchers[++index];
      }
      if (matcher == null) {
        return true;
      }
    }
    return false;
  }

  getPrefix(scopes) {
    if (this.matches(scopes)) {
      return this.prefix;
    }
  }

  toCssSelector() {
    return this.matchers.map(function(matcher) {
      return matcher.toCssSelector();
    }).join(' ');
  }

  toCssSyntaxSelector() {
    return this.matchers.map(function(matcher) {
      return matcher.toCssSyntaxSelector();
    }).join(' ');
  }

};

export class OrMatcher {
  constructor(left1, right1) {
    this.left = left1;
    this.right = right1;
  }

  matches(scopes) {
    return this.left.matches(scopes) || this.right.matches(scopes);
  }

  getPrefix(scopes) {
    return this.left.getPrefix(scopes) || this.right.getPrefix(scopes);
  }

  toCssSelector() {
    return `${this.left.toCssSelector()}, ${this.right.toCssSelector()}`;
  }

  toCssSyntaxSelector() {
    return `${this.left.toCssSyntaxSelector()}, ${this.right.toCssSyntaxSelector()}`;
  }

};

export class AndMatcher {
  constructor(left1, right1) {
    this.left = left1;
    this.right = right1;
  }

  matches(scopes) {
    return this.left.matches(scopes) && this.right.matches(scopes);
  }

  getPrefix(scopes) {
    if (this.left.matches(scopes) && this.right.matches(scopes)) { // The right side can't have prefixes
      return this.left.getPrefix(scopes);
    }
  }

  toCssSelector() {
    if (this.right instanceof NegateMatcher) {
      return `${this.left.toCssSelector()}${this.right.toCssSelector()}`;
    } else {
      return `${this.left.toCssSelector()} ${this.right.toCssSelector()}`;
    }
  }

  toCssSyntaxSelector() {
    if (this.right instanceof NegateMatcher) {
      return `${this.left.toCssSyntaxSelector()}${this.right.toCssSyntaxSelector()}`;
    } else {
      return `${this.left.toCssSyntaxSelector()} ${this.right.toCssSyntaxSelector()}`;
    }
  }

};

export class NegateMatcher {
  constructor(matcher1) {
    this.matcher = matcher1;
  }

  matches(scopes) {
    return !this.matcher.matches(scopes);
  }

  getPrefix(scopes) {}

  toCssSelector() {
    return `:not(${this.matcher.toCssSelector()})`;
  }

  toCssSyntaxSelector() {
    return `:not(${this.matcher.toCssSyntaxSelector()})`;
  }

};

export class CompositeMatcher {
  constructor(left, operator, right) {
    switch (operator) {
      case '|':
        this.matcher = new OrMatcher(left, right);
        break;
      case '&':
        this.matcher = new AndMatcher(left, right);
        break;
      case '-':
        this.matcher = new AndMatcher(left, new NegateMatcher(right));
    }
  }

  matches(scopes) {
    return this.matcher.matches(scopes);
  }

  getPrefix(scopes) {
    return this.matcher.getPrefix(scopes);
  }

  toCssSelector() {
    return this.matcher.toCssSelector();
  }

  toCssSyntaxSelector() {
    return this.matcher.toCssSyntaxSelector();
  }

};
