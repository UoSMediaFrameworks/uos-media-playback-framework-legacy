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
	
		var groupNames = new Map() //AJF: @todo: load map from config file
		groupNames.set(0, "Admin");
		groupNames.set(1, "Test1");
		groupNames.set(2, "Test2");
		groupNames.set(101, "Chicago");
		groupNames.set(102, "Beijing");
		groupNames.set(103, "Dalian");
		groupNames.set(104, "Kuala Lumpur");
		groupNames.set(105, "Seoul");
		groupNames.set(106, "Manchester");
		
		//console.log("The groupID was set to: " + groupID);
		
		return groupNames.get(parseInt(groupID));
	},
	
	
	clear: function() {
		localStorage.removeItem(HUB_TOKEN);
		localStorage.removeItem(HUB_URL);
		localStorage.removeItem(GROUP_ID);
	}
};