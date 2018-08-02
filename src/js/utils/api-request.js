/*jshint browser: true */
'use strict';

var _ = require('lodash');
var urlParams = function(obj) {
    var params = _.map(obj, function(val, key) {
        return encodeURI(key) + '=' + encodeURI(val);
    }).join('&');
	return  params;
};

var makeRequest = function(ops) {
	var xhr = new XMLHttpRequest();

	//xhr.withCredentials = true; //MK requied inside iframe
	var url = ops.url;
	var onLoad = ops.onLoad || null;
	var method = ops.method || 'GET';
	var headers = ops.headers || {};
	var query = ops.query || {};
	var formData = ops.formData || null;
	var responseParser = ops.responseParser || function(responseText) {
		return responseText;
	};
	var errorHandler = ops.onError ||  function(xhr) {
            if (onLoad) onLoad({'status':xhr.status,'error':xhr.statusText},null);
	};

	xhr.onload = function() {
		if (xhr.status === 200) {
			if (onLoad) onLoad(null,responseParser(xhr.responseText));
		} else {
           errorHandler(xhr)
		}

	};

	xhr.onerror = function() {
		errorHandler(xhr);
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
