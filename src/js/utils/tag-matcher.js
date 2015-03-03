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


function TagRule (tag) {
	this._value = tag;
}

TagRule.prototype.match = function(tagList) {
	return tagList.indexOf(this._value) !== -1 ? true : false;
};


function AndRule (leftRule, rightRule) {
	this._left = leftRule;
	this._right = rightRule;
}

AndRule.prototype.match = function(tagList) {
	return this._left.match(tagList) && this._right.match(tagList);
};


function OrRule (leftRule, rightRule) {
	this._left = leftRule;
	this._right = rightRule;
}

OrRule.prototype.match = function(tagList) {
	return this._left.match(tagList) || this._right.match(tagList);
};


function ParethesisRule (rule) {
	this._rule = rule;
}

ParethesisRule.prototype.match = function(tagList) {
	return this._rule.match(tagList);
};

/****************************************************\
        TagMatcher
\****************************************************/

function TagMatcher (query) {
	this._query = parseQuery(tokenizeQuery(query));
}

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
	return this._query.match(tagList);
};

module.exports = TagMatcher;