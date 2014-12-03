'use strict';

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
		var url = this.getRefNode('url'),
			tags = this.getRefNode('tags');

		SceneActions.addMediaObject(this.props.sceneId, this.state.mediaType, url.value, tags.value);
		url.value = tags.value = '';
	},

	render: function() {
		var urlPlaceholder = this.state.mediaType + ' url';

		return (
			<form onSubmit={this.handleSubmit} className='form-inline'>
				<div className='form-group'>
					<div className='input-group'>
						<div className='btn-group'>
							<MediaButton onClick={this.handleMediaButtonClick} switch={this.state.mediaType} val='image' glyphicon='picture' />
							<MediaButton onClick={this.handleMediaButtonClick} switch={this.state.mediaType} val='video' glyphicon='facetime-video' />
							<MediaButton onClick={this.handleMediaButtonClick} switch={this.state.mediaType} val='audio' glyphicon='volume-up' />
						</div>
					</div>
				</div>

				<div className='form-group'>
					<input ref='url' type='url' className='form-control' placeholder={urlPlaceholder} />
				</div>

				<div className='form-group'>
					<input ref='tags' type='text' className='form-control' placeholder='tag, tag, ...' />
				</div>

				<button className='btn btn-primary' type='submit'>Add</button>
			</form>
		);
	}

});

module.exports = SceneEditor;