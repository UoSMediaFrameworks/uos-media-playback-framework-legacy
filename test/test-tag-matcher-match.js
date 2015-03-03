'use strict';

var TagMatcher = require('../src/js/utils/tag-matcher');
var assert = require('assert');


function testRule(queryList, positiveMatches, negativeMatches) {
	if (typeof queryList === 'string') {
		queryList = [queryList];
	}
	queryList.map(function(query) {
		describe('"' + query + '"', function () {
			positiveMatches.map(function(val) {
				it('should match "' + val.join(', ') + '"', function () {
					assert(new TagMatcher(query).match(val));
				});
			});

			negativeMatches.map(function(val) {
				it('should not match "' + val.join(', ') + '"', function () {
					assert(! new TagMatcher(query).match(val));
				});
			});
		});
	});
	
}

// no tag match
testRule(
	'',
	[
		[],
		['bird'],
		['bird', 'fish']
	],
	[]
);

// single tag match
testRule(
	'bird',
	[
		['bird']
	],
	[
		[],
		['cow']
	]
);

testRule(
	'big bird',
	[
		['big bird', 'small bird']
	],
	[
		['big', 'bird']
	]
);


// simple AND
testRule(
	'bird AND cow pie',
	[
		['cow pie', 'bird', 'donkey'],
		['bird', 'cow pie']
	],
	[
		[],
		['bird'],
		['cow'],
		['bird', 'cow'],
		['bird', 'donkey']
	]
);

// doubled AND
testRule(
	'bird AND cow AND donkey',
	[
		['cow', 'bird', 'donkey'],
		['ok', 'bird', 'donkey', 'cow']
	],
	[
		[],
		['bird'],
		['cow'],
		['bird', 'donkey', 'oxen']
	]
);

// simple OR
testRule(
	[
		'bird OR cow',
		'bird, cow',
	],
	[
		['bird'],
		['cow'],
		['bird', 'dog'],
		['cow', 'bird']
	],
	[
		['dog'],
		[],
		['dog', 'oxen']
	]
); 

// doubled OR
testRule(
	[
		'bird OR cow OR donkey',
		'cow OR donkey OR bird',
		'cow, donkey, bird',
	],
	[
		['bird'],
		['cow'],
		['donkey'],
		['cow', 'bird', 'donkey'],
		['ok', 'cow']
	],
	[
		[],
		['oxen']
	]
);

// OR + AND
testRule(
	[
		'bird AND donkey OR cow',
		'cow OR donkey AND bird'
	],
	[
		['bird', 'donkey'],
		['cow'],
		['bird', 'donkey', 'cow']
	],
	[
		['donkey'],
		['bird'],
		['buzzard'],
		[]
	]
);

testRule(
	[
		'fish OR bird AND donkey OR cow',
	],
	[
		['bird', 'donkey'],
		['bird', 'donkey'],
		['fish'],
		['cow'],
		['bird', 'donkey', 'cow']
	],
	[
		['bird'],
		['donkey']
	]
);


// parens

testRule(
	[
		'(fish)',
	], 
	[
		['fish', 'bird'],
		['fish']
	],
	[
		[],
		['bird']
	]
);

testRule(
	[
		'(fish OR bird) AND cow',
	],
	[
		['bird', 'cow'],
		['fish', 'cow'],
		['fish', 'bird', 'cow'],
	],
	[
		[],
		['bird'],
		['fish'],
		['donkey'],
		['cow'],
		['fish', 'bird'],
		['donkey', 'cow'],
	]
);

testRule(
	[
		'(fish OR bird) AND (donkey OR cow)',
	],
	[
		['bird', 'cow'],
		['bird', 'donkey'],
		['fish', 'cow'],
		['fish', 'donkey'],
		['fish', 'bird', 'donkey', 'cow'],
	],
	[
		['bird'],
		['fish'],
		['donkey'],
		['cow'],
		['fish', 'bird'],
		['donkey', 'cow'],
	]
);

testRule(
	[
		'fish AND (donkey OR cow)',
	],
	[
		['fish', 'bird', 'cow'],
		['fish', 'donkey'],
		['fish', 'cow'],
		['fish', 'donkey'],
		['fish', 'bird', 'donkey', 'cow'],
	],
	[
		['bird'],
		['fish'],
		['donkey'],
		['cow'],
		['fish', 'bird'],
		['donkey', 'cow'],
	]
);

testRule(
	[
		'fish AND (boar AND (duck OR pig))',
		'fish AND boar AND (duck OR pig)',
		'((((fish) AND ((boar)) AND ((duck) OR (pig)))))'
	],
	[
		['fish', 'boar', 'duck'],
		['fish', 'boar', 'pig']
	],
	[
		['fish', 'pig'],
		['fish', 'duck'],
		['duck', 'pig'],
	]
);

testRule(
	[
		'(motivational, success, leadership) AND (depressing OR success)'
	],
	[
		['success']
	],
	[]
);