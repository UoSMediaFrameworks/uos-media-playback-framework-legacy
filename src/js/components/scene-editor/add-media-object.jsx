'use strict';
/*jshint browser: true */

var React = require('react');
var MediaButton = require('./media-button.jsx');
var SceneActions = require('../../actions/scene-actions');
var FormHelper = require('../../mixins/form-helper');
var HubClient = require('../../utils/HubClient');
var getVimeoId = require('../../utils/get-vimeo-id');
var _ = require('lodash');

var SceneEditor = React.createClass({

	mixins: [FormHelper],

	getInitialState: function() {
		return {
			mediaType: 'image'
		};
	},

	handleMediaButtonClick: function(mediaType) {
		this.setState({mediaType: mediaType});
	},

	handleSubmit: function(event) {
		event.preventDefault();
		var content = this.getRefNode('content'),
			data = content.value;

		var addMediaObject = function (obj) {
			SceneActions.addMediaObject(this.props.scene, obj);	
			content.value = '';	
		}.bind(this);

		
		var vimeoId =  getVimeoId(data); 
		if (vimeoId) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
			    if (xhr.status === 200) {
			    	var tags = _.map(JSON.parse(xhr.responseText), function(tag) { return tag.trim(); });
			    	addMediaObject({
			    		type: 'video', 
			    		url: data,
			    		tags: tags.join(', ')
			    	});
			    } else {
			    	console.log('failed ' + xhr.status);
			    }
			};

			xhr.onerror = function() {
			    console.log('tasg request failed');
			};

			xhr.open('GET', process.env.MEDIA_HUB + '/api/vimeo-tags?token=' + HubClient.getToken() + '&vimeoId=' + vimeoId);
			xhr.send();
		} else {
			addMediaObject({type: 'text', text: data});
		}
	},

	render: function() {
		return (
			<form onSubmit={this.handleSubmit} className='add-media-object'>
				
				<input ref='content' 
				       className='form-control' 
				       placeholder='vimeo url or text' 
				       required />

				<button className='btn btn-primary' type='submit'>Add</button>
			</form>
		);
	}

});

module.exports = SceneEditor;