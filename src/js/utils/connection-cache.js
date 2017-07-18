'use strict';
/*jshint browser:true */

var HUB_TOKEN = 'HUB_TOKEN',
    HUB_URL = 'HUB_URL',
	GROUP_ID = '-1',
    Socket_ID = 'SOCKET_ID',
    groupNames = []; //AJF: initialise groupID

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

module.exports = {
	getToken: function() {
	    return localStorage.getItem(HUB_TOKEN) || getCookie(HUB_TOKEN);
	},
	setSocketID: function(socketId){
        localStorage.setItem(Socket_ID,socketId);
    },
	getSocketID:function(){
	    return localStorage.getItem(Socket_ID);
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
    setGroupNameArray:function(){
        groupNames = new Map(); //AJF: @todo: load map from config file
        groupNames.set(0, "Admin");
        groupNames.set(1, "Test1");
        groupNames.set(2, "Test2");
        groupNames.set(101, "Chicago");
        groupNames.set(102, "Beijing");
        groupNames.set(103, "Dalian");
        groupNames.set(104, "Kuala Lumpur");
        groupNames.set(105, "Seoul");
        groupNames.set(106, "Manchester");
        groupNames.set(107, "Chengdu");
        groupNames.set(108, "Hong Kong");
        groupNames.set(109, "Shenyang");
        groupNames.set(110, "Panjin");
        groupNames.set(111, "Memoir");
        groupNames.set(112, "NARM");
        groupNames.set(113, "Yibing");
        groupNames.set(114, "Mirroring Life");
        groupNames.set(115, "DPL");
        groupNames.set(116, "Salford Press");

    },
    getGroupNameArray:function(){
        return groupNames;
    },
	getShortGroupName: function(groupID) {
		console.log("The groupID was set to: " + groupID,groupNames);
		return groupNames.get(parseInt(groupID));
	},


	clear: function() {
		localStorage.removeItem(HUB_TOKEN);
		localStorage.removeItem(HUB_URL);
		localStorage.removeItem(GROUP_ID);
	}
};
