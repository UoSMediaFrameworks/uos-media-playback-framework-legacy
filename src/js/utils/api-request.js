/*jshint browser: true */
'use strict';

var _ = require('lodash');

var urlParams = function(obj) {
	return _.map(obj, function(val, key) {
		return encodeURI(key) + '=' + encodeURI(val);
	}).join('&');
};

var makeRequest = function(ops) {
	var xhr = new XMLHttpRequest();
	var url = ops.url;
	var onLoad = ops.onLoad || null;
	var method = ops.method || 'GET';
	var headers = ops.headers || {};
	var query = ops.query || {};
	var formData = ops.formData || null;
	var responseParser = ops.responseParser || function(responseText) {
		return responseText;
	};
	var errorHandler = ops.onError ||  function(status) {
		throw 'XMLHttpRequest failed to "' + url + '"';
	};

	xhr.onload = function() {
		if (xhr.status === 200) {

			if (onLoad) onLoad(responseParser(xhr.responseText));	
		} else {
			errorHandler(xhr.status);
		}
		
	};

	xhr.onerror = function() {
		errorHandler(xhr.status);
	};
	
	xhr.open(method, url + '?' + urlParams(query));
	_.forEach(headers, function(value, key) {
		xhr.setRequestHeader(key, value);
	});
	xhr.send(formData);
	return xhr;
};

module.exports = {
	makeRequest: makeRequest,
	urlParams: urlParams
};