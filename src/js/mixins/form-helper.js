'use strict';

var ReactDOM = require('react-dom');

module.exports = {

	getRefNode: function(name) {
        return ReactDOM.findDOMNode(this.refs[name]);
	},

	getRefVal: function(name) {
        return ReactDOM.findDOMNode(this.refs[name]).value;
	},

	setRefVal: function(name, value) {
        ReactDOM.findDOMNode(this.refs[name]).value = value;
	}
};
