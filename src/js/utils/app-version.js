'use strict';

var makeRequest = require('./api-request').makeRequest;
var jsonParser = require('./json-parser');

var APP_VERSION_URL = 'version.json';

var cache = {};

module.exports = {
    getVersion: function() {
        if(Object.keys(cache).length === 0) {
            makeRequest({
                url: APP_VERSION_URL,
                responseParser: jsonParser,
                onLoad: function(data) {
                    cache = data;
                    return data;
                },
                onError: function(err){
                    return null;
                }
            });
        } else {
            return cache;
        }
    }
};
