'use strict';
/*jshint browser:true */

var TWEEN = require('tween.js');

module.exports = setInterval(function() {
	TWEEN.update();
}, 250);