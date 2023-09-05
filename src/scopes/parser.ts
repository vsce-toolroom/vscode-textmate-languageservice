/* eslint-disable */

/* --------------------------------------------------------------------------------------------
 *  Copyright (c) GitHub Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * -------------------------------------------------------------------------------------------*/
'use strict';

import * as matchers from './matchers';

const peggyParser: { parse: any; SyntaxError: any; DefaultTracer?: any } = (function () {
    'use strict';

    function peg$subclass(child, parent) {
        function C() {
            this.constructor = child;
        }
        C.prototype = parent.prototype;
        child.prototype = new C();
    }

    function peg$SyntaxError(message, expected, found, location): void {
        const self = Error.call(this, message);
        // istanbul ignore next Check is a necessary evil to support older environments
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(self, peg$SyntaxError.prototype);
        }
        self.expected = expected;
        self.found = found;
        self.location = location;
        self.name = 'SyntaxError';
        return self;
    }

    peg$subclass(peg$SyntaxError, Error);

    function peg$padEnd(str, targetLength, padString) {
        padString = padString || ' ';
        if (str.length > targetLength) {
            return str;
        }
        targetLength -= str.length;
        padString += padString.repeat(targetLength);
        return str + padString.slice(0, targetLength);
    }

    peg$SyntaxError.prototype.format = function (sources) {
        let str = 'Error: ' + this.message;
        if (this.location) {
            let src = null;
            let k;
            for (k = 0; k < sources.length; k++) {
                if (sources[k].source === this.location.source) {
                    src = sources[k].text.split(/\r\n|\n|\r/g);
                    break;
                }
            }
            const s = this.location.start;
            const offset_s =
                this.location.source && typeof this.location.source.offset === 'function'
                    ? this.location.source.offset(s)
                    : s;
            const loc = this.location.source + ':' + offset_s.line + ':' + offset_s.column;
            if (src) {
                const e = this.location.end;
                const filler = peg$padEnd('', offset_s.line.toString().length, ' ');
                const line = src[s.line - 1];
                const last = s.line === e.line ? e.column : line.length + 1;
                const hatLen = last - s.column || 1;
                str +=
                    '\n --> ' +
                    loc +
                    '\n' +
                    filler +
                    ' |\n' +
                    offset_s.line +
                    ' | ' +
                    line +
                    '\n' +
                    filler +
                    ' | ' +
                    peg$padEnd('', s.column - 1, ' ') +
                    peg$padEnd('', hatLen, '^');
            } else {
                str += '\n at ' + loc;
            }
        }
        return str;
    };

    peg$SyntaxError.buildMessage = function (expected, found) {
        const DESCRIBE_EXPECTATION_FNS = {
            literal: function (expectation) {
                return '"' + literalEscape(expectation.text) + '"';
            },

            class: function (expectation) {
                const escapedParts = expectation.parts.map(function (part) {
                    return Array.isArray(part) ? classEscape(part[0]) + '-' + classEscape(part[1]) : classEscape(part);
                });

                return '[' + (expectation.inverted ? '^' : '') + escapedParts.join('') + ']';
            },

            any: function () {
                return 'any character';
            },

            end: function () {
                return 'end of input';
            },

            other: function (expectation) {
                return expectation.description;
            }
        };

        function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }

        function literalEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g, function (ch) {
                    return '\\x0' + hex(ch);
                })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return '\\x' + hex(ch);
                });
        }

        function classEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/\]/g, '\\]')
                .replace(/\^/g, '\\^')
                .replace(/-/g, '\\-')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g, function (ch) {
                    return '\\x0' + hex(ch);
                })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return '\\x' + hex(ch);
                });
        }

        function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }

        function describeExpected(expected) {
            const descriptions = expected.map(describeExpectation);
            let i, j;

            descriptions.sort();

            if (descriptions.length > 0) {
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                    }
                }
                descriptions.length = j;
            }

            switch (descriptions.length) {
                case 1:
                    return descriptions[0];

                case 2:
                    return descriptions[0] + ' or ' + descriptions[1];

                default:
                    return descriptions.slice(0, -1).join(', ') + ', or ' + descriptions[descriptions.length - 1];
            }
        }

        function describeFound(found) {
            return found ? '"' + literalEscape(found) + '"' : 'end of input';
        }

        return 'Expected ' + describeExpected(expected) + ' but ' + describeFound(found) + ' found.';
    };

    function peg$parse(input, options) {
        options = options !== undefined ? options : {};

        const peg$FAILED = {};
        const peg$source = options.grammarSource;

        const peg$startRuleFunctions = { start: peg$parsestart };
        let peg$startRuleFunction = peg$parsestart;

        const peg$c0 = '.';
        const peg$c1 = ':';
        const peg$c2 = '(';
        const peg$c3 = ')';
        const peg$c4 = '-';
        const peg$c5 = ',';

        const peg$r0 = /^[a-zA-Z0-9+_]/;
        const peg$r1 = /^[a-zA-Z0-9\-+_]/;
        const peg$r2 = /^[*]/;
        const peg$r3 = /^[LRB]/;
        const peg$r4 = /^[|&\-]/;
        const peg$r5 = /^[ \t]/;

        const peg$e0 = peg$classExpectation([['a', 'z'], ['A', 'Z'], ['0', '9'], '+', '_'], false, false);
        const peg$e1 = peg$classExpectation([['a', 'z'], ['A', 'Z'], ['0', '9'], '-', '+', '_'], false, false);
        const peg$e2 = peg$classExpectation(['*'], false, false);
        const peg$e3 = peg$literalExpectation('.', false);
        const peg$e4 = peg$classExpectation(['L', 'R', 'B'], false, false);
        const peg$e5 = peg$literalExpectation(':', false);
        const peg$e6 = peg$literalExpectation('(', false);
        const peg$e7 = peg$literalExpectation(')', false);
        const peg$e8 = peg$literalExpectation('-', false);
        const peg$e9 = peg$classExpectation(['|', '&', '-'], false, false);
        const peg$e10 = peg$literalExpectation(',', false);
        const peg$e11 = peg$classExpectation([' ', '\t'], false, false);

        const peg$f0 = function (selector) {
            return selector;
        };
        const peg$f1 = function (segment) {
            return new matchers.SegmentMatcher(segment);
        };
        const peg$f2 = function (asterisk) {
            return new matchers.TrueMatcher();
        };
        const peg$f3 = function (first, others) {
            return new matchers.ScopeMatcher(first, others);
        };
        const peg$f4 = function (prefix, first, others) {
            return new matchers.PathMatcher(prefix, first, others);
        };
        const peg$f5 = function (prefix, selector) {
            return new matchers.GroupMatcher(prefix, selector);
        };
        const peg$f6 = function (group) {
            return new matchers.NegateMatcher(group);
        };
        const peg$f7 = function (path) {
            return new matchers.NegateMatcher(path);
        };
        const peg$f8 = function (left, operator, right) {
            return new matchers.CompositeMatcher(left, operator, right);
        };
        const peg$f9 = function (left, right) {
            if (right) {
                return new matchers.OrMatcher(left, right);
            } else {
                return left;
            }
        };
        let peg$currPos = 0;
        let peg$savedPos = 0;
        const peg$posDetailsCache = [{ line: 1, column: 1 }];
        let peg$maxFailPos = 0;
        let peg$maxFailExpected = [];
        const peg$silentFails = 0;

        let peg$result;

        if ('startRule' in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error('Can\'t start parsing from rule "' + options.startRule + '".');
            }

            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function text() {
            return input.substring(peg$savedPos, peg$currPos);
        }

        function offset() {
            return peg$savedPos;
        }

        function range() {
            return {
                source: peg$source,
                start: peg$savedPos,
                end: peg$currPos
            };
        }

        function location() {
            return peg$computeLocation(peg$savedPos, peg$currPos);
        }

        function expected(description, location) {
            location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);

            throw peg$buildStructuredError(
                [peg$otherExpectation(description)],
                input.substring(peg$savedPos, peg$currPos),
                location
            );
        }

        function error(message, location) {
            location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);

            throw peg$buildSimpleError(message, location);
        }

        function peg$literalExpectation(text, ignoreCase) {
            return { type: 'literal', text: text, ignoreCase: ignoreCase };
        }

        function peg$classExpectation(parts, inverted, ignoreCase) {
            return { type: 'class', parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }

        function peg$anyExpectation() {
            return { type: 'any' };
        }

        function peg$endExpectation() {
            return { type: 'end' };
        }

        function peg$otherExpectation(description) {
            return { type: 'other', description: description };
        }

        function peg$computePosDetails(pos) {
            let details = peg$posDetailsCache[pos];
            let p;

            if (details) {
                return details;
            } else {
                p = pos - 1;
                while (!peg$posDetailsCache[p]) {
                    p--;
                }

                details = peg$posDetailsCache[p];
                details = {
                    line: details.line,
                    column: details.column
                };

                while (p < pos) {
                    if (input.charCodeAt(p) === 10) {
                        details.line++;
                        details.column = 1;
                    } else {
                        details.column++;
                    }

                    p++;
                }

                peg$posDetailsCache[pos] = details;

                return details;
            }
        }

        function peg$computeLocation(startPos, endPos, offset?) {
            const startPosDetails = peg$computePosDetails(startPos);
            const endPosDetails = peg$computePosDetails(endPos);

            const res = {
                source: peg$source,
                start: {
                    offset: startPos,
                    line: startPosDetails.line,
                    column: startPosDetails.column
                },
                end: {
                    offset: endPos,
                    line: endPosDetails.line,
                    column: endPosDetails.column
                }
            };
            if (offset && peg$source && typeof peg$source.offset === 'function') {
                res.start = peg$source.offset(res.start);
                res.end = peg$source.offset(res.end);
            }
            return res;
        }

        function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) {
                return;
            }

            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }

            peg$maxFailExpected.push(expected);
        }

        function peg$buildSimpleError(message, location) {
            return new peg$SyntaxError(message, null, null, location);
        }

        function peg$buildStructuredError(expected, found, location) {
            return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
        }

        function peg$parsestart() {
            let s0, s1, s2, s3;

            s0 = peg$currPos;
            s1 = peg$parse_();
            s2 = peg$parseselector();
            if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                peg$savedPos = s0;
                s0 = peg$f0(s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseatom() {
            let s0, s1, s2, s3, s4, s5;

            s0 = peg$currPos;
            s1 = peg$parse_();
            s2 = peg$currPos;
            s3 = [];
            if (peg$r0.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e0);
                }
            }
            if (s4 !== peg$FAILED) {
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    if (peg$r0.test(input.charAt(peg$currPos))) {
                        s4 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                }
            } else {
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s4 = [];
                if (peg$r1.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e1);
                    }
                }
                while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    if (peg$r1.test(input.charAt(peg$currPos))) {
                        s5 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e1);
                        }
                    }
                }
                s3 = [s3, s4];
                s2 = s3;
            } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                peg$savedPos = s0;
                s0 = peg$f1(s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                if (peg$r2.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parse_();
                    peg$savedPos = s0;
                    s0 = peg$f2(s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }

            return s0;
        }

        function peg$parsescope() {
            let s0, s1, s2, s3, s4, s5;

            s0 = peg$currPos;
            s1 = peg$parseatom();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 46) {
                    s4 = peg$c0;
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e3);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseatom();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s4 = peg$c0;
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e3);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseatom();
                        if (s5 !== peg$FAILED) {
                            s4 = [s4, s5];
                            s3 = s4;
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f3(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parsepath() {
            let s0, s1, s2, s3, s4, s5, s6;

            s0 = peg$currPos;
            s1 = peg$currPos;
            if (peg$r3.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                }
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                    s3 = peg$c1;
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e5);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
                s1 = null;
            }
            s2 = peg$parsescope();
            if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$currPos;
                s5 = peg$parse_();
                s6 = peg$parsescope();
                if (s6 !== peg$FAILED) {
                    s5 = [s5, s6];
                    s4 = s5;
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$currPos;
                    s5 = peg$parse_();
                    s6 = peg$parsescope();
                    if (s6 !== peg$FAILED) {
                        s5 = [s5, s6];
                        s4 = s5;
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f4(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parsegroup() {
            let s0, s1, s2, s3, s4, s5, s6;

            s0 = peg$currPos;
            s1 = peg$currPos;
            if (peg$r3.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e4);
                }
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                    s3 = peg$c1;
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e5);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
                s1 = null;
            }
            if (input.charCodeAt(peg$currPos) === 40) {
                s2 = peg$c2;
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e6);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                s4 = peg$parseselector();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parse_();
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s6 = peg$c3;
                        peg$currPos++;
                    } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e7);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f5(s1, s4);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }

            return s0;
        }

        function peg$parseexpression() {
            let s0, s1, s2, s3, s4;

            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 45) {
                s1 = peg$c4;
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e8);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                s3 = peg$parsegroup();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parse_();
                    peg$savedPos = s0;
                    s0 = peg$f6(s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 45) {
                    s1 = peg$c4;
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e8);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parse_();
                    s3 = peg$parsepath();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parse_();
                        peg$savedPos = s0;
                        s0 = peg$f7(s3);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parsegroup();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parsepath();
                    }
                }
            }

            return s0;
        }

        function peg$parsecomposite() {
            let s0, s1, s2, s3, s4, s5;

            s0 = peg$currPos;
            s1 = peg$parseexpression();
            if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (peg$r4.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e9);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parse_();
                    s5 = peg$parsecomposite();
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f8(s1, s3, s5);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseexpression();
            }

            return s0;
        }

        function peg$parseselector() {
            let s0, s1, s2, s3, s4, s5;

            s0 = peg$currPos;
            s1 = peg$parsecomposite();
            if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s3 = peg$c5;
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parse_();
                    s5 = peg$parseselector();
                    if (s5 === peg$FAILED) {
                        s5 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f9(s1, s5);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parsecomposite();
            }

            return s0;
        }

        function peg$parse_() {
            let s0, s1;

            s0 = [];
            if (peg$r5.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e11);
                }
            }
            while (s1 !== peg$FAILED) {
                s0.push(s1);
                if (peg$r5.test(input.charAt(peg$currPos))) {
                    s1 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e11);
                    }
                }
            }

            return s0;
        }

        peg$result = peg$startRuleFunction();

        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail(peg$endExpectation());
            }

            throw peg$buildStructuredError(
                peg$maxFailExpected,
                peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
                peg$maxFailPos < input.length
                    ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                    : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
            );
        }
    }

    return {
        SyntaxError: peg$SyntaxError,
        parse: peg$parse
    };
})();

export interface FilePosition {
    offset: number;
    line: number;
    column: number;
}

export interface FileRange {
    start: FilePosition;
    end: FilePosition;
    source: string;
}

export interface LiteralExpectation {
    type: 'literal';
    text: string;
    ignoreCase: boolean;
}

export interface ClassParts extends Array<string | ClassParts> {}

export interface ClassExpectation {
    type: 'class';
    parts: ClassParts;
    inverted: boolean;
    ignoreCase: boolean;
}

export interface AnyExpectation {
    type: 'any';
}

export interface EndExpectation {
    type: 'end';
}

export interface OtherExpectation {
    type: 'other';
    description: string;
}

export type Expectation = LiteralExpectation | ClassExpectation | AnyExpectation | EndExpectation | OtherExpectation;

declare class _PeggySyntaxError extends Error {
    public static buildMessage(expected: Expectation[], found: string | null): string;
    public message: string;
    public expected: Expectation[];
    public found: string | null;
    public location: FileRange;
    public name: string;
    constructor(message: string, expected: Expectation[], found: string | null, location: FileRange);
    format(
        sources: {
            source?: any;
            text: string;
        }[]
    ): string;
}

export interface TraceEvent {
    type: string;
    rule: string;
    result?: any;
    location: FileRange;
}

declare class _DefaultTracer {
    private indentLevel: number;
    public trace(event: TraceEvent): void;
}

peggyParser.SyntaxError.prototype.name = 'PeggySyntaxError';

export interface ParseOptions {
    filename?: string;
    startRule?: 'start';
    tracer?: any;
    [key: string]: any;
}
export type ParseFunction = <Options extends ParseOptions>(
    input: string,
    options?: Options
) => Options extends { startRule: infer StartRule } ? (StartRule extends 'start' ? Start : Start) : Start;
export const parse: ParseFunction = peggyParser.parse;

export const PeggySyntaxError = peggyParser.SyntaxError as typeof _PeggySyntaxError;

export type PeggySyntaxError = _PeggySyntaxError;

// These types were autogenerated by ts-pegjs
export type Start = matchers.ParsedMatcher;
export type Atom = matchers.AtomMatcher;
export type Scope = matchers.ScopeMatcher;
export type Path = matchers.PathMatcher;
export type Group = matchers.GroupMatcher;
export type Expression = matchers.ExpressionMatcherType;
export type Composite = matchers.CompositeMatcherType;
export type Selector = matchers.ParsedMatcher;
export type _ = Array<' ' | '	'>;
