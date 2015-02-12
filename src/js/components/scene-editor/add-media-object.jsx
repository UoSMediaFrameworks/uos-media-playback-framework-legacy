'use strict';
/*jshint browser: true */

var React = require('react');
var MediaButton = require('./media-button.jsx');
var SceneActions = require('../../actions/scene-actions');
var FormHelper = require('../../mixins/form-helper');

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
			data = content.value,
			mediaObject;

		// check and see if it's a vimeo url.  Use a regex because I'm only detecting a specific
		// case of a vimeo url.  Everything else is interpretted as text
		if (data.match('^https?://vimeo\\.com')) {
			mediaObject = {type: 'video', url: data};
		} else {
			mediaObject = {type: 'text', text: data};
		}

		var parser = document.createElement('a');
		parser.href = content.value;

		SceneActions.addMediaObject(this.props.scene, mediaObject);		
		content.value = '';
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