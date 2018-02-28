'use strict';
/*jshint browser:true */

var TWEEN = require('@tweenjs/tween.js');

module.exports = setInterval(function() {
	TWEEN.update();
}, 250);
