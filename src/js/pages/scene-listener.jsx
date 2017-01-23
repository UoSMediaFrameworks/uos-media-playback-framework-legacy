'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var SceneStore = require('../stores/full-scene-store');
var ThemeSelector = require('../components/theme-selector.jsx');
var HubSendActions = require('../actions/hub-send-actions');
var FormHelper = require('../mixins/form-helper');
var Router = require('react-router');
var Authentication = require('../mixins/Authentication');
var Loader = require('../components/loader.jsx');
var _ = require('lodash');
var $ = require('jquery');
var TagMatcher = require('../utils/tag-matcher');
var MediaObjectQueue = require('../utils/media-object/media-object-queue');
var TextMediaObject = require('../utils/media-object/text-media-object');
var ImageMediaObject = require('../utils/media-object/image-media-object');
var VideoMediaObject = require('../utils/media-object/video-media-object');
var AudioMediaObject = require('../utils/media-object/audio-media-object');
var RandomVisualPlayer = require('../components/viewer/random-visual-player.jsx');
var ActiveTheme = require('../components/viewer/viewer-active-theme.jsx');

var SceneListener = React.createClass({

    statics: {
        willTransitionFrom: function(transition, component) {
            HubSendActions.unsubscribeScene(component.getParams().id);
        }
    },

    _getSceneId: function() {
        if(this.props.activeScene) {
            return this.props.activeScene._id;
        }

        var sceneId = this.props.sceneId || this.props.params.id;

        return sceneId;
    },

    _getScene: function() {

        if(this.props.activeScene) {
            return this.props.activeScene;
        }

        var sceneId = this.props.sceneId || this.props.params.id;

        // console.log("SceneListener - _getScene - sceneId: ", sceneId);

        return SceneStore.getScene(sceneId);
    },

    getInitialState: function() {
        return {
            scene: this._getScene(),
            activeThemes: [],
            fromGraphViewer: this.props.activeScene ? true : false
        };
    },

    getPlayerElem: function() {
        return this.refs.player;
    },

    _getSceneForUpdatingPlayerComponent: function() {
        return this.props.activeScene || this.state.scene;
    },

    _setPlayerClassCssForScene: function(style) {
        _.forEach(Object.keys(style), function(styleKey){
            var styleValue = style[styleKey];

            $('.player').css(styleKey, styleValue);
        });
    },

    _maybeUpdatePlayer: function() {

        var scene = this._getSceneForUpdatingPlayerComponent();

        if (scene) {

            // APEP Remove the old style added ready for new style or fallback to css class
            $('.player').removeAttr("style");
            if (scene.style) {
                this._setPlayerClassCssForScene(scene.style);
            }

            // console.log("SceneListenr - setScene for mediaObjectQueue - this.props.activeScene:", this.props.activeScene);

            this.mediaObjectQueue.setScene(scene, {hardReset: true}); // TODO APEP {hardReset: true} I don't think we want to forcefully removal all
            // APEP the tag matcher will make sure all active media not related to new scene is removed

            if(this.props.themeQuery) {
                var themeQry = scene.themes[this.props.themeQuery];
                this.mediaObjectQueue.setTagMatcher(new TagMatcher(themeQry));
            }
        }
    },
    componentWillMount:function(){
        this.mediaObjectQueue = new MediaObjectQueue(
            [TextMediaObject, AudioMediaObject, VideoMediaObject, ImageMediaObject],
            {image: 3, text: 1, video: 1, audio: 1}
        );
        this.setState({mediaObjectQueue: this.mediaObjectQueue});
    },
    componentDidMount: function() {
        HubSendActions.subscribeScene(this._getSceneId());
        SceneStore.addChangeListener(this._onChange);
        this.mediaObjectQueue = new MediaObjectQueue(
            [TextMediaObject, AudioMediaObject, VideoMediaObject, ImageMediaObject],
            {image: 3, text: 1, video: 1, audio: 1}
        );
        this.setState({mediaObjectQueue: this.mediaObjectQueue});
        this._maybeUpdatePlayer();
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function(prevProps, prevState) {

        if (! _.isEqual(prevState.scene, this.state.scene) ) {
            this._maybeUpdatePlayer();
        } else if (! _.isEqual(prevProps.activeScene, this.props.activeScene)) {
            this._maybeUpdatePlayer();
        }

        this.updateTags();
    },

    mergeTagAndThemeFilters: function() {
        var filterStrings = _.map(this.state.activeThemes, function(themeName) {
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));

        var tagsInput = this.getRefVal('tags').trim();
        if (tagsInput !== '') {
            filterStrings.push('(' + tagsInput + ')');
        }

        return new TagMatcher(filterStrings.join(' OR '));
    },

    updateTags: function(event) {
        if (event) {
            event.preventDefault();
        }
        var tagFilter = this.mergeTagAndThemeFilters();
        if(this.state.mediaObjectQueue)
            this.state.mediaObjectQueue.setTagMatcher(tagFilter);
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

        // APEP Display Active Theme if available, if not provide a theme selector
        var ThemeDisplay = this.props.themeQuery ? <ActiveTheme themeQuery={this.props.themeQuery}/> : <ThemeSelector themeChange={this.handleThemeChange} scene={this._getSceneForUpdatingPlayerComponent()} />;

        // APEP Only display the tag form when this component is not used within the graph viewer
        var TagForm = ! this.state.fromGraphViewer ? <form className='tag-filter' onSubmit={this.updateTags}>
            <input ref='tags' onBlur={this.handleBlur} type='text' placeholder='tag, tag, ...' className='form-control scene-listener-tag-input' />
        </form> : <span></span>;

        return (
            <div className='scene-listener'>
                <Loader loaded={this.state.scene ? true : false}></Loader>
                <RandomVisualPlayer mediaQueue={this.state.mediaObjectQueue} />
                {ThemeDisplay}
                {TagForm}
            </div>
        );
    }

});

module.exports = SceneListener;
