'use strict';

var VideoUtils = require('../../src/js/utils/video-utils');
var assert = require('assert');
var _ = require('lodash');

describe('VideoUtils', function() {

    describe('getTranscodedUrl', function() {

        var urls = [{
            testNo: 1,
            rawUrl: "https://devuosassetstore.blob.core.windows.net/assetstoredev/video/raw/5979dd38071fd02464a6ce89/test.mp4",
            expectedTranscodedUrl: "https://devuosassetstore.blob.core.windows.net/assetstoredev/video/transcoded/dash/5979dd38071fd02464a6ce89/video_manifest.mpd"
        },
            {
                testNo: 2,
                rawUrl: "https://uosassetstore.blob.core.windows.net/assetstoredev/video/raw/5979dd38071fd02464a6ce89/test.mp4",
                expectedTranscodedUrl: "https://uosassetstore.blob.core.windows.net/assetstoredev/video/transcoded/dash/5979dd38071fd02464a6ce89/video_manifest.mpd"
            }
        ];

        _.forEach(urls, function(testUrl) {
            it('replaces the raw directory - testNo - ' + testUrl.testNo, function() {
                var actualTranscodedUrl = VideoUtils.getTranscodedUrl(testUrl.rawUrl);
                assert(actualTranscodedUrl === testUrl.expectedTranscodedUrl);
            });
        });

    });

});
