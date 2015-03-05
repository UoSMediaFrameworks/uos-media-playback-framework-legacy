/*jshint browser: true */
'use strict';

var _ = require('lodash');

var urlParams = function(obj) {
	return _.map(obj, function(val, key) {
		return encodeURI(key) + '=' + encodeURI(val);
	}).join('&');
};


module.exports = function(ops) {
	var xhr = new XMLHttpRequest();
	var url = ops.url;
	var onLoad = ops.onLoad;
	var headers = ops.headers || {};
	var query = ops.query || {};

	var errorHandler = ops.onError ||  function(status) {
		throw 'XMLHttpRequest failed to "' + url + '"';
	};

	xhr.onload = function() {
		if (xhr.status === 200) {
			onLoad(JSON.parse(xhr.responseText));	
		} else {
			errorHandler(xhr.status);
		}
		
	};

	xhr.onerror = function() {
		errorHandler(xhr.status);
	};
	
	xhr.open('GET', url + '?' + urlParams(query));
	_.forEach(headers, function(value, key) {
		xhr.setRequestHeader(key, value);
	});
	xhr.send();
	return xhr;
};
