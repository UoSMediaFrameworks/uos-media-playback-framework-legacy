/*jshint browser: true */
'use strict';

module.exports = function(responseText) {
	try {
		console.log("Response Text", responseText);
		return JSON.parse(responseText);
	} catch(err) {
		return null
	}
};
