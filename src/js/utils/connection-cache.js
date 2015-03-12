'use strict';
/*jshint browser:true */

var HUB_TOKEN = 'HUB_TOKEN',
    HUB_URL = 'HUB_URL';

module.exports = {
	getToken: function() {
	    return localStorage.getItem(HUB_TOKEN);
	},
	setHubUrl: function(url) {
		localStorage.setItem(HUB_URL, url);
	},
	setHubToken: function(token) {
		localStorage.setItem(HUB_TOKEN, token);
	},
	
	clear: function() {
		localStorage.removeItem(HUB_TOKEN);
		localStorage.removeItem(HUB_URL);  	
	}
};