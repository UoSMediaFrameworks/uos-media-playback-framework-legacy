'use strict';

module.exports = function (data) {
	// check and see if it's a vimeo url.  Use a regex because I'm only detecting a specific
	// case of a vimeo url.  Everything else is interpretted as text
	var match = data.match('^https?://vimeo\\.com.*?(\\d+)$');

	if (match) {
		return match[1];
	}

};