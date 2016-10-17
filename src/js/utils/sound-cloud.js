/*jshint browser: true */
'use strict';

var API_URL = 'http://api.soundcloud.com/';
var objectAssign = require('object-assign');
var apiRequest = require('./api-request');
var jsonParser = require('./json-parser');
var _ = require('lodash');
var toastr = require('toastr');

if (!process.env.SOUNDCLOUD_CLIENT_ID) {
    throw 'SoundCloud client id is required, please set it in environment variables';
}

var resolveCache = {};

var resolveAttribute = function (soundCloudUrl, attr, callback) {
    var finish = function () {
        if (Array.isArray(attr)) {
            callback(null,_.map(attr, function (a) {
                return resolveCache[soundCloudUrl][a];
            }));
        } else {
            callback(null,resolveCache[soundCloudUrl][attr]);
        }

    };
    if (resolveCache.hasOwnProperty(soundCloudUrl)) {
        finish();
    } else {
        var query = {
            client_id: process.env.SOUNDCLOUD_CLIENT_ID,
            url: soundCloudUrl
        };
        apiRequest.makeRequest({
            url: API_URL + 'resolve.json',
            responseParser: jsonParser,
            query: query,
            onLoad: function (err, data) {
                if (err) {
                    callback(err)
                } else {
                    resolveCache[soundCloudUrl] = data;
                    finish();
                }
            }
        });
    }
};

function identity(val) {
    return val;
}

function apiHandler(attribute, transform) {
    var trans = transform || identity;

    return function (soundCloudUrl, callback) {

        resolveAttribute(soundCloudUrl, attribute, function (err,attributeValue) {
            if(err){
                callback(err)
            }else{
                callback(null,trans(attributeValue));
            }
        });
    };
}

var tagRegexp = /\s*?(?:"([^"]+)"|([^\s]+))\s*?/;

function convertTags(tagString) {
    // sound cloud has it's tags space seperated, and multi word tags
    // are enclosed in quotes
    // this is a quick little tokenizer/parser to make them match our
    // comma seperated format
   var tags =  tagString.split(" ");
    var array = _.uniq(tags);
    return array.join(',');
}

module.exports = {
    waveformUrl: apiHandler('waveform_url'),
    title: apiHandler('title'),
    tags: apiHandler(['genre', 'tag_list']),
    streamUrl: apiHandler('stream_url', function (url) {
        return url + '?' + apiRequest.urlParams({client_id: process.env.SOUNDCLOUD_CLIENT_ID});
    }),
    convertTags: convertTags
};

