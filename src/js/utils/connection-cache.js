'use strict';
/*jshint browser:true */

var HUB_TOKEN = 'HUB_TOKEN',
    HUB_URL = 'HUB_URL',
	GROUP_ID = '-1'; //AJF: initialise groupID 

module.exports = {
	getToken: function() {
	    return localStorage.getItem(HUB_TOKEN);
	},
	setHubUrl: function(url) {
		localStorage.setItem(HUB_URL, url);
	},
	setHubToken: function(token) {
		localStorage.setItem(HUB_TOKEN, token);
	},
	setGroupID: function(id) {
		console.log("Setting groupID in connectionCache to: " + id);
		localStorage.setItem(GROUP_ID, id);
	},
	getGroupID: function() {
		return localStorage.getItem(GROUP_ID);
	},
	getShortGroupName: function(groupID) {
	
		var groupNames = [ //AJF: @todo: load map from config file
		{id : 0, name: "Admin"},
		{id : 1, name: "Test1"},
		{id : 2, name: "Test2"},
		{id : 101, name: "Chicago"},
		{id : 102, name: "Beijing"},
		{id : 103, name: "Dalian"},
		{id : 104, name: "Kuala Lumpur"},
		{id : 105, name: "Seoul"},
		{id : 106, name: "Manchester"}
		];
		
		//console.log("The groupID was set to: " + groupID);
		
		return groupNames[groupID].name;
	},
	
	
	clear: function() {
		localStorage.removeItem(HUB_TOKEN);
		localStorage.removeItem(HUB_URL);
		localStorage.removeItem(GROUP_ID);
	}
};