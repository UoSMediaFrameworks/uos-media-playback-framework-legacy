'use strict';

module.exports = {
	
	getRefNode: function(name) {
		return this.refs[name].getDOMNode();
	},

	getRefVal: function(name) {
		return this.refs[name].getDOMNode().value;
	},

	setRefVal: function(name, value) {
		this.refs[name].getDOMNode.value = value;
	}
};