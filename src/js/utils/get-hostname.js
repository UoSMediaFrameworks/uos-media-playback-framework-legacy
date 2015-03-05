'use strict';
/*jshint browser: true */


module.exports = function(urlStr) {
	var parser = document.createElement('a');
	parser.href = urlStr;
	return parser.hostname;
};