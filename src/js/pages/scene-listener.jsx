'use strict';

var React = require('react');
var SceneStore = require('../stores/scene-store');
var ScenePlayer = require('../components/scene-player.jsx');
var ThemeSelector = require('../components/theme-selector.jsx');
var HubSendActions = require('../actions/hub-send-actions');
var randomScenePlayer = require('../utils/random-scene-player');
var scenePlayerElementManager = require('../utils/scene-player-element-manager');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');

var SceneListener = React.createClass({

    mixins: [Router.State, FormHelper],

    statics: {
        willTransitionFrom: function(transition, component) {
            HubSendActions.unsubscribeScene(component.getParams().id);
        }
    },

    _getState: function() {
        return {scene: SceneStore.getScene(this.getParams().id)};
    },

    getInitialState: function() {
        return this._getState();
    },

    componentDidMount: function() {
        HubSendActions.subscribeScene(this.getParams().id);
        SceneStore.addChangeListener(this._onChange);

        var playerElem = this.getDOMNode().querySelector('.player');
        this.player = randomScenePlayer(scenePlayerElementManager(playerElem));
        this.player.setScene(this.state.scene);
        this.player.start();
    },
    
    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    updateTags: function(event) {
        if (event) {
            event.preventDefault();
        }

        var tagNode = this.getRefNode('tags');
        this.player.setTagFilter(tagNode.value);
        tagNode.blur();
    },

    handleBlur: function(event) {
        this.updateTags();
    },
    
    _onChange: function() {
        this.setState(this._getState());
        this.player.setScene(this.state.scene);
    },

    handleThemeChange: function(newThemes) {
        this.player.setThemeFilter(newThemes);
    },

    render: function() {
        return (
            <div className='scene-listener'>
                <div className='player'></div>
                <ThemeSelector themeChange={this.handleThemeChange} scene={this.state.scene} />
                <form onSubmit={this.updateTags}>
                    <input ref='tags' onBlur={this.handleBlur} type='text' placeholder='tag, tag, ...' className='form-control scene-listener-tag-input' />
                </form>
            </div>
        );
    }

});

module.exports = SceneListener;