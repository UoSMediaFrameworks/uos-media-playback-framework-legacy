'use strict';

var React = require('react');
var SceneStore = require('../stores/scene-store');
var ScenePlayer = require('./scene-player.jsx');
var HubSendActions = require('../actions/hub-send-actions');
var randomScenePlayer = require('../utils/random-scene-player');
var scenePlayerElementManager = require('../utils/scene-player-element-manager');
var Router = require('react-router');

var SceneListener = React.createClass({

    mixins: [Router.State],

    statics: {
        willTransitionFrom: function(transition, component) {
            HubSendActions.unsubscribeScene(component.getParams().id);
        }
    },

    _getState: function() {
        return {scene: SceneStore.getScene(this.getParams().id)};
    },

    getInitialState: function() {
        return this._getState(this.props.sceneId);
    },

    componentDidMount: function() {
        HubSendActions.subscribeScene(this.getParams().id);
        SceneStore.addChangeListener(this._onChange);

        var playerElem = this.getDOMNode();
        var player = randomScenePlayer(scenePlayerElementManager(playerElem));
        player.setScene(this.state.scene);
        player.start();

        this.setState({player: player});
    },
    
    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },
    
    _onChange: function() {
        this.setState(this._getState());
        this.state.player.setScene(this.state.scene);
    },

    render: function() {
        return (
            <div id='scene-player' className='player'></div>
        );
    }

});

module.exports = SceneListener;