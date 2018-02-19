'use strict';

var React = require('react');
var _ = require('lodash');

var ThemeButton = React.createClass({

	handleClick: function(event) {
		this.props.onClick(this.props.theme);
	},

	render: function() {
		var klass = 'btn btn-dark',
			aria = '';
		if (this.props.selected) {
			klass += ' active';
			aria = 'true';
		}

		return (
			<button onClick={this.handleClick} ref="theme-name" type='button' className={klass} aria-pressed={aria}>{this.props.theme}</button>
		);
	}
});

var ThemeSelector = React.createClass({

	getInitialState: function() {
		return {
			selected: {}
		};
	},

	handleClick: function(key) {
		var selected = this.state.selected;
		selected[key] = ! selected[key];

		var selectedKeys = [];
		_.forEach(selected, function(value, key) {
			if (selected[key]) {
				selectedKeys.push(key);
			}
		});
		this.props.themeChange(selectedKeys);

		this.setState({selected: selected});
	},

	render: function() {
		var scene = this.props.scene || {};
		var classNames = 'theme-selector';
		if(this.props.shouldHide) {
		    classNames += ' hidden';
        }
		return (
			<div className={classNames} ref="theme-selector">
			{_.keys(scene.themes).map(function(key) {
				return <ThemeButton onClick={this.handleClick} theme={key} selected={this.state.selected[key]} key={key} />;
			}.bind(this))}
			</div>
		);
	}

});

module.exports = ThemeSelector;
