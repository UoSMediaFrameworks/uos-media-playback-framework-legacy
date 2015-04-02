'use strict';

var React = require('react');
var SceneStore = require('../stores/scene-store');
var ThemeSelector = require('../components/theme-selector.jsx');
var HubSendActions = require('../actions/hub-send-actions');
var RandomVisualPlayer = require('../utils/random-visual-player');
var RandomAudioPlayer = require('../utils/random-audio-player');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');
var Authentication = require('../mixins/Authentication');
var Loader = require('../components/loader.jsx');
var _ = require('lodash');
var $ = require('jquery');
var TagMatcher = require('../utils/tag-matcher');
var MediaObjectQueue = require('../utils/media-object/media-object-queue');
var EmbeddedVimeoPlayer = require('../utils/embedded-vimeo-player');

var SceneListener = React.createClass({

    mixins: [Router.State, FormHelper, Authentication],

    statics: {
        willTransitionFrom: function(transition, component) {
            HubSendActions.unsubscribeScene(component.getParams().id);
        }
    },

    _getScene: function() {
        return SceneStore.getScene(this.getParams().id);
    },

    getInitialState: function() {
        return {
            scene: this._getScene(),
            activeThemes: []
        };
    },

    getPlayerElem: function() {
        return this.getDOMNode().querySelector('.player');
    },

    _maybeUpdatePlayer: function() {
        if (this.state.scene) {
            if (this.state.scene.style) {
                $(this.getPlayerElem()).css(this.state.scene.style);
            }
        
            this.mediaObjectQueue.setScene(this.state.scene);    
            this.randomVisualPlayer.start();
            this.randomAudioPlayer.start();
        }
    },

    componentDidMount: function() {
        HubSendActions.subscribeScene(this.getParams().id);
        SceneStore.addChangeListener(this._onChange);
        HubSendActions.loadScene(this.getParams().id);

        var playerElem = this.getPlayerElem();
        
        this.mediaObjectQueue = new MediaObjectQueue();
        this.randomVisualPlayer = new RandomVisualPlayer(playerElem, this.mediaObjectQueue);
        this.randomAudioPlayer = new RandomAudioPlayer(this.mediaObjectQueue);

        this._maybeUpdatePlayer();
    },
    
    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function(prevProps, prevState) {
        this._maybeUpdatePlayer();
        this.updateTags();
    },

    mergeTagAndThemeFilters: function() {
        var themeQueries = _.map(this.state.activeThemes, function(themeName) {
            return this.state.scene.themes[themeName];
        }.bind(this));
        
        var mergedString = _.map(themeQueries.concat([this.getRefVal('tags')]), function(v) {
            return '(' + v + ')';
        }).join(' AND ');

        return new TagMatcher(mergedString);
    },

    updateTags: function(event) {
        if (event) {
            event.preventDefault();
        }
        var tagFilter = this.mergeTagAndThemeFilters();
        this.randomAudioPlayer.setTagMatcher(tagFilter);
        this.randomVisualPlayer.setTagMatcher(tagFilter);
    },

    handleBlur: function(event) {
        this.updateTags();
    },
    
    _onChange: function() {
        this.setState({scene: this._getScene()});
    },

    handleThemeChange: function(newThemes) {
        this.setState({activeThemes: newThemes});
    },

    render: function() {
        return (
            <div className='scene-listener'>
                <Loader loaded={this.state.scene ? true : false}></Loader>
                <div className='player'></div>
                <ThemeSelector themeChange={this.handleThemeChange} scene={this.state.scene} />
                <form className='tag-filter' onSubmit={this.updateTags}>
                    <input ref='tags' onBlur={this.handleBlur} type='text' placeholder='tag, tag, ...' className='form-control scene-listener-tag-input' />
                </form>

            </div>
        );
    }

});

module.exports = SceneListener;