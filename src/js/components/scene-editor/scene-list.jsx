'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneListStore = require('../../stores/scene-list-store');

function _getState () {
	return {scenes: SceneListStore.getAll()};
}

var _blank = 'BLANK';

var SceneList = React.createClass({
	getInitialState: function() {
		return _getState();
	},
	
	componentDidMount: function() {
		SceneListStore.addChangeListener(this._onChange);
	},
	
	componentWillUnmount: function() {
		SceneListStore.removeChangeListener(this._onChange);
	},
	
	_onChange: function() {
		this.setState(_getState());
	},

	handleSelectChange: function(e) {
		var val = e.target.value;
		if (val !== _blank) {
			HubSendActions.loadScene(val);
		}
	},

	render: function() {
		var options = this.state.scenes.map(function(scene) {
			return (
				<option key={scene._id} value={scene._id}>{scene.name}</option>
			);
		});

		options.unshift(<option key={_blank} value={_blank}>Choose a Scene...</option>);

		return (
			<select onChange={this.handleSelectChange}>{options}</select>
		);
	}

});

module.exports = SceneList;