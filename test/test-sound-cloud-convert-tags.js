'use strict';

var soundCloud = require('../src/js/utils/sound-cloud');
var assert = require('chai').assert;

describe('soundCloud.convertTags()', function () {
    var matches = [
        ["\"Creative Culture Music Group\" \"Creative CultureMG\" @Eskvr @JRossRossedUp",
        "Creative Culture Music Group, Creative CultureMG, @Eskvr, @JRossRossedUp"],
        ["birds cats #dogs", "birds, cats, #dogs"],
        ["birds", "birds"],
        ['"birds and cats" cats', 'birds and cats, cats']
    ];

    matches.forEach(function(data) {
        it('should convert "' + data[0] + '" to "' + data[1] + '"', function () {
            assert.strictEqual(soundCloud.convertTags(data[0]), data[1]);
        });
    });
});

