'use strict';

var _ = require('lodash');

var AND_TOKEN = 'AND',
	OR_TOKEN = 'OR',
	OPEN_PAREN_TOKEN = '(',
	CLOSE_PAREN_TOKEN = ')';

var TOKEN_REGEXP = /\s+AND\s+|\s+OR\s+|\s?\(\s?|\s?\)\s?/;
/****************************************************\
		Rules
\****************************************************/

function EmptyRule () {

}

EmptyRule.prototype.match = function(tagList) {
	return true;
};

EmptyRule.prototype.equalTo = function(emptyRule) {
	return emptyRule instanceof EmptyRule;
};

EmptyRule.prototype.toString = function() {
	return '';
};


function TagRule (tag) {
	this._value = tag;
}

TagRule.prototype.match = function(tagList) {
    var self = this;
    if(typeof tagList === "string"){
        var matches = _.filter(tagList.split(","), function(tag) {
            // APEP we can then compare each tag to find a match - trim is something we may or may not want
            return tag.trim() === self._value;
        });
    }else{
        var matches = _.filter(tagList, function(tag) {
            // APEP we can then compare each tag to find a match - trim is something we may or may not want
            return tag === self._value;
        });
    }
    // APEP Split the tag list using the delimiter we've enforced on the user
    console.log("matches",matches);

    return matches.length > 0;
};

TagRule.prototype.equalTo = function(tagRule) {
	return tagRule instanceof TagRule && this._value === tagRule._value;
};

TagRule.prototype.toString = function() {
	return this._value;
};


function AndRule (leftRule, rightRule) {
	this._left = leftRule;
	this._right = rightRule;
}

AndRule.prototype.match = function(tagList) {
	return this._left.match(tagList) && this._right.match(tagList);
};

AndRule.prototype.equalTo = function(andRule) {
	return andRule instanceof AndRule &&
		this._left.equalTo(andRule._left) &&
		this._right.equalTo(andRule._right);
};

AndRule.prototype.toString = function() {
	return this._left.toString() + ' AND ' + this._right.toString();
};


function OrRule (leftRule, rightRule) {
	this._left = leftRule;
	this._right = rightRule;
}

OrRule.prototype.match = function(tagList) {
	return this._left.match(tagList) || this._right.match(tagList);
};

OrRule.prototype.equalTo = function(orRule) {
	return orRule instanceof OrRule &&
		this._left.equalTo(orRule._left) &&
		this._right.equalTo(orRule._right);
};

OrRule.prototype.toString = function() {
	return this._left.toString() + ' OR ' + this._right.toString();
};



function ParethesisRule (rule) {
	this._rule = rule;
}

ParethesisRule.prototype.match = function(tagList) {
	return this._rule.match(tagList);
};

ParethesisRule.prototype.equalTo = function(rule) {
	return rule instanceof ParethesisRule &&
		this._rule.equalTo(rule._rule);
};

ParethesisRule.prototype.toString = function() {
	return '(' + this._rule.toString() + ')';
};


/****************************************************\
        TagMatcher
\****************************************************/

function TagMatcher (query) {
	this._query = parseQuery(tokenizeQuery(query || ''));
}

TagMatcher.prototype.toString = function() {
	return this._query.toString();
};

function parseQuery (tokens) {

	// catch the easy case first, single tag
	if (tokens.length === 0) {
		return new EmptyRule();
	} else if (tokens.length === 1) {
		var toke = tokens[0];
		if (toke instanceof ParethesisRule) {
			return toke;
		} else {
			return new TagRule(tokens[0]);
		}
	} else {
		// first look for wrapped parenthesis
		// process all sets of parenthesis before continuing
		var openParenIndex = tokens.indexOf(OPEN_PAREN_TOKEN);
		while (openParenIndex !== -1) {
			// find the matching closer
			var closePos = openParenIndex,
				counter = 1;

			while (counter > 0 && closePos < tokens.length) {
				var token = tokens[++closePos];
				if (token === OPEN_PAREN_TOKEN) {
					counter++;
				} else if (token === CLOSE_PAREN_TOKEN) {
					counter--;
				}
			}

			if (counter > 0) {
				throw 'Unfound closing parenthesis in tokens ' + tokens;
			}

			var pre = tokens.slice(0, openParenIndex);
			var rule = new ParethesisRule(parseQuery(tokens.slice(openParenIndex + 1, closePos)));
			var post = tokens.slice(closePos + 1);

			tokens = [].concat(pre, rule, post);
			openParenIndex = tokens.indexOf(OPEN_PAREN_TOKEN);

		}

		// then look for OR
		var leftTokens, rightTokens;
		var orIndex = tokens.indexOf(OR_TOKEN);
		if (orIndex !== -1) {
			leftTokens = tokens.slice(0, orIndex);
			rightTokens = tokens.slice(orIndex + 1);
			return new OrRule(parseQuery(leftTokens), parseQuery(rightTokens));
		} else {
			// look for AND
			var andIndex = tokens.indexOf(AND_TOKEN);
			if (andIndex !== -1) {
				leftTokens = tokens.slice(0, andIndex);
				rightTokens = tokens.slice(andIndex + 1);
				return new AndRule(parseQuery(leftTokens), parseQuery(rightTokens));
			} else {
				// all done, nothing else to check, just return our one rule now
				return tokens[0];
			}
		}
	}
}



function tokenizeQuery (query) {
	var tokens = [];
	query = query.replace(/,/g, ' OR ').trim();

	var match,
		matchString = query;
	while (matchString !== '') {
		match = TOKEN_REGEXP.exec(matchString);

		if (! match) {
			tokens.push(matchString.trim());
			break;
		} else {
			// first break off the tags prior to the token
			if (match.index !== 0) {
				var tagToke = matchString.substring(0, match.index).trim();
				tokens.push(tagToke);
			}

			// now put on the matched token
			tokens.push(match[0].trim());

			// advance the startIndex
			// add a space on the front to add back the space that went missing from the match
			var offset = match.index + match[0].length;
			if (matchString.charAt(offset-1) === ' ') {
				offset--;
			}

			matchString = matchString.substring(offset);
		}

	}


	return tokens;
}

TagMatcher.prototype.match = function(tagList) {
    console.log("tag",tagList)
	return this._query.match(tagList);
};

TagMatcher.prototype.equalTo = function(tagMatcher) {
	return this._query.equalTo(tagMatcher._query);
};

module.exports = TagMatcher;
