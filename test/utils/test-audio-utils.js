'use strict';

var AudioUtils = require('../../src/js/utils/audio-utils');
var assert = require('assert');
var _ = require('lodash');

describe('AudioUtils', function() {

    describe('getTranscodedUrl', function() {

        var urls = [{
                testNo: 1,
                rawUrl: "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5979dd38071fd02464a6ce89/air_raid.wav",
                expectedTranscodedUrl: "https://devuosassetstore.blob.core.windows.net/assetstoredev/audio/transcoded/mp3/5979dd38071fd02464a6ce89/audio_320k.mp3"
            },
            {
                testNo: 2,
                rawUrl: "https://uosassetstore.blob.core.windows.net/assetstoredev/audio/raw/5979dd38071fd02464a6ce89/air_raid.wav",
                expectedTranscodedUrl: "https://uosassetstore.blob.core.windows.net/assetstoredev/audio/transcoded/mp3/5979dd38071fd02464a6ce89/audio_320k.mp3"
            }
        ];

        _.forEach(urls, function(testUrl) {
            it('replaces the raw directory - testNo - ' + testUrl.testNo, function() {
                var actualTranscodedUrl = AudioUtils.getTranscodedUrl(testUrl.rawUrl);
                assert(actualTranscodedUrl === testUrl.expectedTranscodedUrl);
            });
        });

    });

});

