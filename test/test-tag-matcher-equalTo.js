'use strict';

var TagMatcher = require('../src/js/utils/tag-matcher');
var assert = require('assert');

describe('TagMatcher.equalTo()', function () {
	[
		'', 
		'bananas',
		'big bird',
		'bird AND cow pie',
		'bird AND cow AND donkey',
		'bird OR cow',
		'bird, cow',
		'bird OR cow OR donkey',
		'cow OR donkey OR bird',
		'cow, donkey, bird',
		'bird AND donkey OR cow',
		'cow OR donkey AND bird',
		'fish OR bird AND donkey OR cow',
		'(fish)',
		'(fish OR bird) AND cow',
		'(fish OR bird) AND (donkey OR cow)',
		'fish AND (donkey OR cow)',
		'fish AND (boar AND (duck OR pig))',
		'fish AND boar AND (duck OR pig)',
		'((((fish) AND ((boar)) AND ((duck) OR (pig)))))'

	].map(function(query) {
		it('should return true with query of "' + query + '"', function () {
			assert(new TagMatcher(query).equalTo(new TagMatcher(query)));		
		});
	});
	
});