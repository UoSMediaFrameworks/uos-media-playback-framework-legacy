'use strict';

var React = require('react');
var SceneStore = require('../stores/full-scene-store');
var ThemeSelector = require('../components/theme-selector.jsx');
var HubSendActions = require('../actions/hub-send-actions');
var Authentication = require('../mixins/Authentication');
var Loader = require('../components/loader.jsx');
var _ = require('lodash');
var TagMatcher = require('../utils/tag-matcher');
var MediaObjectQueueManager = require('../utils/media-object/media-object-queue-manager');
var TextMediaObject = require('../utils/media-object/text-media-object');
var ImageMediaObject = require('../utils/media-object/image-media-object');
var VideoMediaObject = require('../utils/media-object/video-media-object');
var AudioMediaObject = require('../utils/media-object/audio-media-object');
var RandomVisualPlayer = require('../components/viewer/random-visual-player.jsx');
var GraphViewerStore = require('../stores/graph-viewer-store');
var ActiveTheme = require('../components/viewer/viewer-active-theme.jsx');
var hat = require('hat');

var MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY = -2;

function getTypeByName(typeName) {
    var t = _.find([TextMediaObject, ImageMediaObject, VideoMediaObject, AudioMediaObject], function (t) {
        return t.typeName === typeName;
    });

    if (!t) {
        throw 'type "' + typeName + '" not found.  Needs to be passed to constructor.';
    }

    return t;
}

var SceneListener = React.createClass({

    _getSceneId: function () {
        if (this.props.activeScene) {
            return this.props.activeScene._id;
        }
        return this.props.sceneId || this.props.params.id;
    },

    _getScene: function () {

        try {
            if (this.props.activeScene) {
                return this.props.activeScene;
            }

            var sceneId = this._getSceneId();

            if(sceneId === null) {
                return null;
            }

            console.log("SceneListener - _getScene - sceneId: ", sceneId);
            return SceneStore.getScene(sceneId);
        } catch (e) {
            console.log("SceneListener - _getScene - error loading full Scene", e);
            return null;
        }
    },

    getInitialState: function () {
        return {
            scene: this._getScene(),
            activeThemes: [],
            fromGraphViewer: this.props.hasOwnProperty("activeScene") && this.props.activeScene !== null,
            triggeredActiveThemes: {},
            cuePointMediaObjects: [],
            shouldHide: !this.props.sceneViewer // APEP we are given a param from our parent to let us know if we are being driven from an external source or simply to preview a scene
        };
    },

    _getSceneForUpdatingPlayerComponent: function () {
        return this.props.activeScene || this.state.scene;
    },

    _maybeUpdatePlayer: function () {

        var scene = this._getSceneForUpdatingPlayerComponent();

        if (scene) {
            console.log("SceneListener - _maybeUpdatePlayer - setScene - scene:", scene);

            this.setState({scene:scene});

            // TODO APEP {hardReset: true} I don't think we want to forcefully removal all
            // APEP if we are forcing full scene playback, lets force transitions.  Only do in this case.
            this.mediaObjectQueue.setScene(scene, {hardReset: GraphViewerStore.getPlayFullScenesOpt()});

            this.updateTags();
        }
    },

    _updatePlayersTagMatcher: function() {
        var scene = this._getSceneForUpdatingPlayerComponent();

        if (scene) {
            console.log("SceneListener - _updatePlayersTagMatcher");
            this.updateTags();
        }
    },

    // APEP func to update after queue has made internal switch between modes
    mediaQueueManagerUpdate: function () {
        this.setState({mediaObjectQueue: this.mediaObjectQueue});
    },

    componentWillMount: function () {
        console.log("listener will mount",this);
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
            this.setState({shouldHide: !this.state.shouldHide});
        }
    },

    componentWillReceiveProps:function(nextProps){
        console.log("SceneListener - componentWillReceiveProps", nextProps);

        // APEP we should not set scene state here.  We've not checked if we actually need to
    },

    componentDidMount: function () {
        try {
            SceneStore.addChangeListener(this._onChange);
            this._maybeUpdatePlayer();
        } catch (e) {
            console.log("componentDidMount - e: ", e);
        }
        document.addEventListener("keyup", this.toggleTagMatcherAndThemes)
    },

    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        document.removeEventListener("keyup", this.toggleTagMatcherAndThemes)
    },

    componentDidUpdate: function (prevProps, prevState) {

        if (!_.isEqual(prevState.scene, this.state.scene) || !_.isEqual(prevProps.activeScene, this.props.activeScene)) {

            // APEP TODO I don't think I am correctly getting the scene._id, i should use one of our implemented methods that capture the differences in state.scene or props.activeScene

            // APEP if we switch activeScene, we should make sure we unsubscribe for updates from previous scenes
            HubSendActions.unsubscribeScene(prevProps.activeScene._id);
            // And resubscribe to the new active scene
            HubSendActions.subscribeScene(this.props.activeScene._id);

            // APEP only fully update player if scene has actually changed.  The setting of the full scene for the queue triggers the masterList to be recreated, losing instance based properties like guid, causing the difference(active) to fail.
            this._maybeUpdatePlayer();
        } else if (!_.isEqual(prevState.activeThemes, this.state.activeThemes)) {
            // console.log("ActiveTheme changed - update player");
            this._updatePlayersTagMatcher();
        } else if (!_.isEqual(prevState.triggeredActiveThemes, this.state.triggeredActiveThemes)) {
            // console.log("TriggeredActiveTheme changed - update player");
            this._updatePlayersTagMatcher();
        } else if (!_.isEqual(prevProps.themeQuery, this.props.themeQuery)) {
            // console.log("themeQuery changed - update player");
            this._updatePlayersTagMatcher();
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

        return new TagMatcher(tagsJoinedForBoolStatement);
    },

    // APEP Updates the mediaQueue with the correct tag matcher
    updateTags: function (event) {
        if (event) {
            event.preventDefault();
        }

        if (this.props.themeQuery) {
            if (this.state.mediaObjectQueue) {
                // APEP the tag matcher will make sure all active media not related to new scene is removed.njn
                this.state.mediaObjectQueue.setTagMatcher(new TagMatcher("(" + this.props.themeQuery + ")"));

                // APEP if using the theme query provides no media, set the tag matcher with an empty rule.
                // APEP the below check is used to allow tagMatcher changes only to still calculate the correct value.  This is an optimization to avoid have to filter the masterList in the queues
                var currentMatchedMedia = this.state.mediaObjectQueue.getQueue().length + this.state.mediaObjectQueue.getActive().length;
                if (currentMatchedMedia <= MINIMUM_NUMBER_OF_MEDIA_TO_BE_MATCHED_WITH_THEME_QUERY) {
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
        this.setState({scene: this._getScene()});
    },

    handleThemeChange: function (newThemes) {
        this.setState({activeThemes: newThemes});
    },

    cueMediaObjectDoneHandler: function (mediaObjectGuid) {

        // console.log("cueMediaObjectDoneHandler - mediaObject.guid: ", mediaObjectGuid);

        var moFoundIndex = _.findIndex(this.state.cuePointMediaObjects, function (mo) {
            return mo.guid === mediaObjectGuid
        });

        if (moFoundIndex !== -1) {
            var cuePointsMediaObjects = this.state.cuePointMediaObjects;

            cuePointsMediaObjects.splice(moFoundIndex, 1);

            // console.log("SPLICE - old length, new length: ", this.state.cuePointMediaObjects.length, cuePointsMediaObjects.length);

            this.setState({cuePointMediaObjects: cuePointsMediaObjects});
        }

    },

    // APEP function for adding themes triggered by a piece of media
    // APEP a reference counter is used to ensure that we track overlapping or duplicate triggers
    // We also create cue point media objects directly from a trigger request, these are stored and
    // managed locally for this object
    triggerMediaActiveTheme: function (themes) {

        var self = this;

        console.log("scene-listener - triggerMediaActiveTheme - called");

        // APEP using the themes given, we add the themes into the triggered mapping object
        var triggeredActiveThemes = this.state.triggeredActiveThemes;
        _.forEach(themes, function (theme) {
            if (!triggeredActiveThemes.hasOwnProperty(theme)) {
                // We either create a new counter for the theme
                triggeredActiveThemes[theme] = 1;
            } else {
                // Or increment the counter
                triggeredActiveThemes[theme]++;
            }
        });

        // APEP for all of the newly triggered active themes, create a tag matcher instance matching each of these themes
        var tagMatcherStatements = _.map(themes, function (themeName) {
            return '(' + this.state.scene.themes[themeName] + ')';
        }.bind(this));
        var tagMatcher = new TagMatcher(tagMatcherStatements.join(" OR "));

        var scene = this._getSceneForUpdatingPlayerComponent();

        // APEP search media objects for matching tags and create a local state copy of wanted media objects to be force to screen
        var cuePointMediaObjects = _.chain(scene.scene)
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
        // APEP Display Active Theme if available, if not provide a theme selector
        var ThemeDisplay = this.state.fromGraphViewer ?
            <ActiveTheme ref="theme" scene={this.state.scene} themeQuery={this.props.themeQuery}/> :
            <ThemeSelector ref="theme" shouldHide={this.state.shouldHide} themeChange={this.handleThemeChange}
                           scene={this._getSceneForUpdatingPlayerComponent()}/>;

        // APEP Only display the tag form when this component is not used within the graph viewer
        var TagForm = !this.state.fromGraphViewer ?
            <form className='tag-filter' ref="tag_form" onSubmit={this.updateTags}>
                <input ref='tags' onBlur={this.handleBlur} type='text' placeholder='tag, tag, ...'
                       className='form-control scene-listener-tag-input'/>
            </form> : <span></span>;

        if (this.state.scene) {
            return (
                <div className={ this.props.sceneViewer ? "mf-local-width scene-listener" : "scene-listener"} ref="scene_listener">
                    <Loader loaded={this.state.scene !== null}></Loader>
                    <RandomVisualPlayer sceneStyle={this.state.scene.style}
                                        mediaQueue={this.state.mediaObjectQueue}
                                        triggerMediaActiveTheme={this.triggerMediaActiveTheme}
                                        removeMediaActiveThemesAfterDone={this.removeMediaActiveThemesAfterDone}
                                        cuePointMediaObjects={this.state.cuePointMediaObjects}
                                        cueMediaObjectDoneHandler={this.cueMediaObjectDoneHandler}/>
                    {ThemeDisplay}
                    {TagForm}
                </div>
            );
        } else {
            return (<div className="mf-empty-grid-component">No scene loaded for viewing</div>)
        }

    }

});

module.exports = SceneListener;
