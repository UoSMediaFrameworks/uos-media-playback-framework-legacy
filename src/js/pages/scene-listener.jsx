'use strict';

var React = require('react');
var SceneStore = require('../stores/full-scene-store');
var PlaybackStore = require('../stores/playback/playback-store');
var HubSendActions = require('../actions/hub-send-actions');
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
var ThemeSelector = require('../components/theme-selector.jsx');
var TagSelector = require('../components/tag-selector.jsx');
var hat = require('hat');

var MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY = 0;

function getTypeByName(typeName) {
    var t = _.find([TextMediaObject, ImageMediaObject, VideoMediaObject, AudioMediaObject], function (t) {
        return t.typeName === typeName;
    });

    if (!t) {
        throw 'type "' + typeName + '" not found.  Needs to be passed to constructor.';
    }

    return t;
}

/**
 * APEP In development comments
 * themeQuery - provided from a scene-theme tour
 * activeThemes - provided from the theme selector TODO refactor this into the store
 *
 * TODO refactor below into store as well
 * triggeredActiveThemes - comes from cue point media activating a theme for additional content
 * cuePointMediaObjects - is the mapped list of media from a triggeredActiveTheme
 */
var SceneListener = React.createClass({

    statics: {
        willTransitionFrom: function (transition, component) {
            //APEP TODO this should be optional as for when this component is from the graph viewer, we are going through so many scenes
            // We do not support live scene update when we cycle between scenes, this could be changed
            HubSendActions.unsubscribeScene(component.getParams().id);
        }
    },

    _getScene: function () {

        // APEP if we are given a params id try use scene store
        if(this.props.params && this.props.params.id) {
            return SceneStore.getScene(this.props.params.id);
        }

        // APEP else we look at the playback store for this value
        return PlaybackStore.getActiveScene();
    },

    _getThemeQuery: function() {
        return PlaybackStore.getActiveThemeQuery();
    },

    getInitialState: function () {
        return {
            scene: this._getScene(),
            activeThemes: [],
            fromGraphViewer: this.props.fromGraphViewer ? true : false,
            triggeredActiveThemes: {},
            cuePointMediaObjects: [],
            shouldHide: false,
            themeQuery: this._getThemeQuery()
        };
    },

    _setPlayerClassCssForScene: function (style) {
        _.forEach(Object.keys(style), function (styleKey) {
            var styleValue = style[styleKey];

            $('.player').css(styleKey, styleValue);
        });
    },

    _maybeUpdatePlayer: function () {

        var scene = this.state.scene;

        if (scene) {
            // APEP Remove the old style added ready for new style or fallback to css class
            $('.player').removeAttr("style");
            if (scene.style) {
                this._setPlayerClassCssForScene(scene.style);
            }

            // console.log("SceneListenr - setScene for mediaObjectQueue - this.props.activeScene:", this.props.activeScene);

            this.mediaObjectQueue.setScene(scene); // TODO APEP {hardReset: true} I don't think we want to forcefully removal all

            this.updateTags();
        }
    },

    // APEP func to update after queue has made internal switch between modes
    mediaQueueManagerUpdate: function () {
        this.setState({mediaObjectQueue: this.mediaObjectQueue});
    },

    componentWillMount: function () {

        console.log("SceneListener will mount");

        // APEP if we are about to mount and have an params.id set, make sure the store is populated with the scene
        if(this.props.params && this.props.params.id) {
            HubSendActions.loadScene(this.props.params.id);
        }

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

    toggleTagMatcherAndThemes: function (event) {
        if (event.altKey && event.keyCode === 72) {
            var tagForm = this.refs["tag_form"];
            tagForm.style.display = !this.state.shouldHide ? "none" : "block";
            this.setState({shouldHide:!this.state.shouldHide});
        }
    },

    componentDidMount: function () {
        // APEP we only subscribe if we have a params.id, meaning we will only ever play the one scene
        if(this.props.params && this.props.params.id) {
            HubSendActions.subscribeScene(this.props.params.id);
        }

        console.log("SceneListener - componentDidMount");

        try {
            SceneStore.addChangeListener(this._onChange);
            PlaybackStore.addChangeListener(this._onChange);
            this._maybeUpdatePlayer();
        } catch (e) {
            console.log("componentDidMount - e: ", e);
        }

        // Add keypress listener
        document.addEventListener("keyup", this.toggleTagMatcherAndThemes)
    },

    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        PlaybackStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function (prevProps, prevState) {

        console.log("componentDidUpdate - looking to see if we need to update the player");

        // APEP TODO need to add themeQuery as allowed change

        if (!_.isEqual(prevState.scene, this.state.scene)) {
            console.log("state.scene changed - update player");
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevState.activeThemes, this.state.activeThemes)) {
            console.log("ActiveTheme changed - update player");
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevState.triggeredActiveThemes, this.state.triggeredActiveThemes)) {
            console.log("TriggeredActiveTheme changed - update player");
            this._maybeUpdatePlayer();
        }

    },

    mergeTagAndThemeFilters: function () {
        var filterStrings = _.map(this.state.activeThemes, function (themeName) {
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));

        var tagsInput = this.refs['tags'];
        if (tagsInput) {
            if (tagsInput.value.length > 0 && tagsInput.value.trim().length > 0) {
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
    updateTags: function (event) {
        if (event) {
            event.preventDefault();
        }

        var scene = this.state.scene;

        if (this.state.themeQuery) {
            // APEP the tag matcher will make sure all active media not related to new scene is removed
            var themeQry = scene.themes[this.state.themeQuery];

            if (this.state.mediaObjectQueue) {
                this.state.mediaObjectQueue.setTagMatcher(new TagMatcher("(" + themeQry + ")"));
                // APEP if using the theme query provides no media, set the tag matcher with an empty rule
                if (this.state.mediaObjectQueue.getQueue().length <= MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY) {
                    this.state.mediaObjectQueue.setTagMatcher(new TagMatcher("()"));
                }
            }
        } else {
            // APEP create a new Tag Matcher instance combining selected themes and written tags
            var tagFilter = this.mergeTagAndThemeFilters();

            if (this.state.mediaObjectQueue) {
                this.state.mediaObjectQueue.setTagMatcher(tagFilter);
            }
        }
    },

    handleBlur: function (event) {
        this.updateTags();
    },

    _onChange: function () {
        console.log("SceneListener - _onChange");
        this.setState({scene: this._getScene(), themeQuery: this._getThemeQuery()});
    },

    // APEP Handle user selecting a theme from theme selector component
    handleThemeChange: function (newThemes) {
        this.setState({activeThemes: newThemes});
    },


    // APEP TODO I think this should be handled by the store but we can leave for now
    cueMediaObjectDoneHandler: function (mediaObjectGuid) {

        // console.log("cueMediaObjectDoneHandler - mediaObject.guid: ", mediaObjectGuid);

        var moFoundIndex = _.findIndex(this.state.cuePointMediaObjects, function (mo) {
            return mo.guid === mediaObjectGuid
        });

        if (moFoundIndex !== -1) {
            var cuePointsMediaObjects = this.state.cuePointMediaObjects;

            cuePointsMediaObjects.splice(moFoundIndex, 1);

            this.setState({cuePointMediaObjects: cuePointsMediaObjects});
        }

    },

    // APEP function for adding themes triggered by a piece of media - ie cue point
    // A reference counter is used to ensure that we track overlapping or duplicate triggers
    // We also create cue point media objects directly from a trigger request, these are stored and
    // managed locally for this object
    triggerMediaActiveTheme: function (themes) {

        var self = this;

        console.log("scene-listener - triggerMediaActiveTheme - called");

        // APEP using the themes given, we add the themes into the triggered mapping object
        // We either create a new counter for the theme
        // Or increment the counter
        var triggeredActiveThemes = this.state.triggeredActiveThemes;
        _.forEach(themes, function (theme) {
            if (!triggeredActiveThemes.hasOwnProperty(theme)) {
                triggeredActiveThemes[theme] = 1;
            } else {
                triggeredActiveThemes[theme]++;
            }
        });

        // APEP for all of the newly triggered active themes, create a tag matcher instance matching each of these themes
        var tagMatcherStatements = _.map(themes, function (themeName) {
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));
        var tagMatcher = new TagMatcher(tagMatcherStatements.join(" OR "));

        var scene = this.state.scene;

        // APEP search media objects for matching tags and create a local state copy of wanted media objects to be force to screen
        var cuePointMediaObjects = _(scene.scene)
            .filter(function (mo) {
                return tagMatcher.match(mo.tags)
            })
            .map(function (mo) {
                var TypeConstructor = getTypeByName(mo.type);
                var newMo = new TypeConstructor(mo, {
                    displayDuration: self.mediaObjectQueue.getDisplayDuration(),
                    transitionDuration: self.mediaObjectQueue.getTransitionDuration()
                });
                newMo.guid = hat(); // APEP create a new instance ID per additional themes media being forced to the screen
                return newMo;
            }).value();

        // APEP merge the current cuePointMediaObjects with the new set from trigger
        this.setState({
            triggeredActiveThemes: triggeredActiveThemes,
            cuePointMediaObjects: this.state.cuePointMediaObjects.concat(cuePointMediaObjects)
        });
    },

    // APEP function handled for each media object to remove themes from the active list
    // APEP this is to be used by any media object that has triggered active themes and is done
    removeMediaActiveThemesAfterDone: function (themes) {

        var triggeredActiveThemes = this.state.triggeredActiveThemes;
        _.forEach(themes, function (theme) {
            if (triggeredActiveThemes.hasOwnProperty(theme)) {
                triggeredActiveThemes[theme]--;

                if (triggeredActiveThemes[theme] === 0) {
                    delete triggeredActiveThemes[theme];
                }
            }
        });

        this.setState({triggeredActiveThemes: triggeredActiveThemes});
    },

    render: function () {

        // APEP If we are from graph viewer, only attempt to display the theme query
        // APEP else we are playing a single scene and should provide the selector tool
        var ThemeDisplay = this.state.fromGraphViewer ?
            <ActiveTheme ref="theme" themeQuery={this.state.themeQuery}/> :
            <ThemeSelector ref="theme" shouldHide={this.state.shouldHide} themeChange={this.handleThemeChange}
                           scene={this.state.scene}/>;

        // APEP Only display the tag form when this component is not used within the graph viewer
        var TagForm = !this.state.fromGraphViewer ?
            <TagSelector updateTags={this.updateTags} handleBlur={this.handleBlur}/>: <span></span>;

        return (
            <div className='scene-listener' ref="scene_listener">
                <Loader loaded={this.state.scene ? true : false}></Loader>

                <RandomVisualPlayer
                    mediaQueue={this.state.mediaObjectQueue}
                    triggerMediaActiveTheme={this.triggerMediaActiveTheme}
                    removeMediaActiveThemesAfterDone={this.removeMediaActiveThemesAfterDone}
                    cuePointMediaObjects={this.state.cuePointMediaObjects}
                    cueMediaObjectDoneHandler={this.cueMediaObjectDoneHandler}/>
                {ThemeDisplay}
                {TagForm}
            </div>
        );
    }

});

module.exports = SceneListener;
