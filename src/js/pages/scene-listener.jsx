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
var MediaObjectQueueManager = require('../utils/media-object/media-object-queue-manager');
var TextMediaObject = require('../utils/media-object/text-media-object');
var ImageMediaObject = require('../utils/media-object/image-media-object');
var VideoMediaObject = require('../utils/media-object/video-media-object');
var AudioMediaObject = require('../utils/media-object/audio-media-object');
var RandomVisualPlayer = require('../components/viewer/random-visual-player.jsx');
var ActiveTheme = require('../components/viewer/viewer-active-theme.jsx');
var hat = require('hat');

var MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY = 0;

function getTypeByName (typeName) {
    var t = _.find([TextMediaObject, ImageMediaObject, VideoMediaObject, AudioMediaObject], function(t) { return t.typeName === typeName; });

    if (! t) {
        throw 'type "' + typeName + '" not found.  Needs to be passed to constructor.';
    }

    return t;
}

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
            fromGraphViewer: this.props.activeScene ? true : false,
            triggeredActiveThemes: {},
            cuePointMediaObjects: []
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

            this.updateTags();
        }
    },

    // APEP func to update after queue has made internal switch between modes
    mediaQueueManagerUpdate: function() {
        this.setState({mediaObjectQueue: this.mediaObjectQueue});
    },

    componentWillMount: function() {
        try {
            this.mediaObjectQueue = new MediaObjectQueueManager(
                [TextMediaObject, AudioMediaObject, VideoMediaObject, ImageMediaObject],
                {image: 3, text: 1, video: 1, audio: 1},
                this.mediaQueueManagerUpdate
            );
            this.setState({mediaObjectQueue: this.mediaObjectQueue});
        } catch (e) {
            console.log("componentWillMount - e: ", e);
        }

    },
    componentDidMount: function() {
        HubSendActions.subscribeScene(this._getSceneId());
        try {
            SceneStore.addChangeListener(this._onChange);
            this._maybeUpdatePlayer();
        } catch (e) {
            console.log("componentDidMount - e: ", e);
        }
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function(prevProps, prevState) {

        if (!_.isEqual(prevState.scene, this.state.scene) ) {
            console.log("state.scene changed - update player");
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevProps.activeScene, this.props.activeScene)) {
            console.log("activeScene changed - update player");
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevState.activeThemes, this.state.activeThemes)) {
            console.log("ActiveTheme changed - update player");
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevState.triggeredActiveThemes, this.state.triggeredActiveThemes)) {
            console.log("TriggeredActiveTheme changed - update player");
            this._maybeUpdatePlayer();
        }

    },

    mergeTagAndThemeFilters: function() {
        var filterStrings = _.map(this.state.activeThemes, function(themeName) {
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));

        var tagsInput = this.refs['tags'];
        if (tagsInput) {
            if(tagsInput.value.length > 0 && tagsInput.value.trim().length > 0) {
                tagsInput = tagsInput.value.trim();
                filterStrings.push('(' + tagsInput + ')');
            }
        }

        // APEP join all the individual sets of tags from themes in a bool OR statement
        var tagsJoinedForBoolStatement = filterStrings.join(' OR ');
        console.log("mergeTagAndThemeFilters: ", tagsJoinedForBoolStatement);
        return new TagMatcher(tagsJoinedForBoolStatement);
    },

    // APEP Updates the mediaQueue with the correct tag matcher
    updateTags: function(event) {
        if (event) {
            event.preventDefault();
        }

        var scene = this._getSceneForUpdatingPlayerComponent();

        if(this.props.themeQuery) {
            // APEP the tag matcher will make sure all active media not related to new scene is removed
            var themeQry = scene.themes[this.props.themeQuery];

            if(this.state.mediaObjectQueue) {
                this.state.mediaObjectQueue.setTagMatcher(new TagMatcher("(" + themeQry + ")"));
                // APEP if using the theme query provides no media, set the tag matcher with an empty rule
                if(this.state.mediaObjectQueue.getQueue().length <= MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY) {
                    this.state.mediaObjectQueue.setTagMatcher(new TagMatcher("()"));
                }
            }
        } else {
            // APEP create a new Tag Matcher instance combining selected themes and written tags
            var tagFilter = this.mergeTagAndThemeFilters();

            if(this.state.mediaObjectQueue) {
                this.state.mediaObjectQueue.setTagMatcher(tagFilter);
            }
        }
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

    cueMediaObjectDoneHandler: function(mediaObjectGuid) {

        console.log("cueMediaObjectDoneHandler - mediaObject.guid: ", mediaObjectGuid);

        var moFoundIndex = _.findIndex(this.state.cuePointMediaObjects, function(mo) { return mo.guid === mediaObjectGuid});

        if(moFoundIndex !== -1) {
            var cuePointsMediaObjects = this.state.cuePointMediaObjects;

            cuePointsMediaObjects.splice(moFoundIndex, 1);

            console.log("SPLICE - old length, new length: ", this.state.cuePointMediaObjects.length, cuePointsMediaObjects.length);

            this.setState({cuePointMediaObjects: cuePointsMediaObjects});
        }

    },

    // APEP function for adding themes triggered by a piece of media
    // APEP a reference counter is used to ensure that we track overlapping or duplicate triggers
    // TODO additional comments
    triggerMediaActiveTheme: function(themes) {

        var self = this;

        console.log("scene-listener - triggerMediaActiveTheme - called");

        var triggeredActiveThemes = this.state.triggeredActiveThemes;
        _.forEach(themes, function(theme) {
            if(!triggeredActiveThemes.hasOwnProperty(theme)) {
                triggeredActiveThemes[theme] = 1;
            } else {
                triggeredActiveThemes[theme]++;
            }
        });

        // APEP for all of the newly triggered active themes, create a tag matcher instance matching each of these themes
        var tagMatcherStatements = _.map(themes, function(themeName) { // TODO can use Object.keys(triggeredActiveThemes)
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));
        var tagMatcher = new TagMatcher(tagMatcherStatements.join(" OR "));

        var scene = this._getSceneForUpdatingPlayerComponent();

        // APEP search media objects for matching tags and create a local state copy of wanted media objects to be force to screen
        var cuePointMediaObjects = _(scene.scene)
            .filter(function(mo){ return tagMatcher.match(mo.tags)})
            .map(function(mo) {
                var TypeConstructor = getTypeByName(mo.type);
                var newMo = new TypeConstructor(mo, {
                    displayDuration: self.mediaObjectQueue.getDisplayDuration(),
                    transitionDuration: self.mediaObjectQueue.getTransitionDuration()
                });
                newMo.guid = hat();
                return newMo;
            }).value();

        // APEP merge the current cuePointMediaObjects with the new set from trigger
        this.setState({triggeredActiveThemes: triggeredActiveThemes, cuePointMediaObjects: this.state.cuePointMediaObjects.concat(cuePointMediaObjects)});
    },

    // APEP function handled for each media object to remove themes from the active list
    // APEP this is to be used by any media object that has triggered active themes and is done
    removeMediaActiveThemesAfterDone: function(themes) {

        var triggeredActiveThemes = this.state.triggeredActiveThemes;
        _.forEach(themes, function(theme) {
            if(triggeredActiveThemes.hasOwnProperty(theme)) {
                triggeredActiveThemes[theme]--;

                if(triggeredActiveThemes[theme] === 0) {
                    delete triggeredActiveThemes[theme];
                }
            }
        });

        this.setState({triggeredActiveThemes: triggeredActiveThemes});
    },

    render: function() {

        // APEP Display Active Theme if available, if not provide a theme selector
        var ThemeDisplay = this.state.fromGraphViewer ? <ActiveTheme themeQuery={this.props.themeQuery}/> : <ThemeSelector themeChange={this.handleThemeChange} scene={this._getSceneForUpdatingPlayerComponent()} />;

        // APEP Only display the tag form when this component is not used within the graph viewer
        var TagForm = ! this.state.fromGraphViewer ? <form className='tag-filter' onSubmit={this.updateTags}>
            <input ref='tags' onBlur={this.handleBlur} type='text' placeholder='tag, tag, ...' className='form-control scene-listener-tag-input' />
        </form> : <span></span>;

        return (
            <div className='scene-listener'>
                <Loader loaded={this.state.scene ? true : false}></Loader>
                <RandomVisualPlayer mediaQueue={this.state.mediaObjectQueue} triggerMediaActiveTheme={this.triggerMediaActiveTheme} removeMediaActiveThemesAfterDone={this.removeMediaActiveThemesAfterDone} cuePointMediaObjects={this.state.cuePointMediaObjects} cueMediaObjectDoneHandler={this.cueMediaObjectDoneHandler} />
                {ThemeDisplay}
                {TagForm}
            </div>
        );
    }

});

module.exports = SceneListener;
