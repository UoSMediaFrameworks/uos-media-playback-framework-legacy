'use strict';

module.exports = function(runFunc, throttleValueFunc) {
	var lastCalled;
	return function tryFunc() {
		var now = new Date().getTime();
		var run = false;
		if (lastCalled) {
			var throttleValue = throttleValueFunc();
		    var elapsed = now - lastCalled;
		    
		    if (elapsed > throttleValueFunc()) {
		        lastCalled = now;
		        return runFunc();
		    } else {
		        // delay till we reach the displayInterval
		        setTimeout(tryFunc, throttleValue - elapsed);
		    }
		} else {
		    lastCalled = now;
		    return runFunc();
		}
	};
};