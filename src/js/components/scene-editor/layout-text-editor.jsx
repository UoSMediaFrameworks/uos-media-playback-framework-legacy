'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneActions = require('../../actions/scene-actions');
var SceneStore = require('../../stores/scene-store');
var _ = require('lodash');
var sha1 = require('sha1');

//TODO APEP: Github issue raised about issue with regex. https://github.com/Microsoft/monaco-editor/issues/216
var sceneMediaObjectRegex = "{[\\s\\S\\n]{1,10}tags[\\s\\S\\n]*?type[\\s\\S\\n]*?[\\s\\S\\n]}"; //APEP Full media object selection
// APEP we must handle any issues that arise from the window being missing (test environment)
var SCHEMA_URL = process.env.NODE_ENV !== "test" ? window.location.origin + "/schemas/scene-schema.json" : "/schemas/scene-schema.json"; // "http://mediaframework.salford.ac.uk/schemas/scene-schema.json";

var SceneMonacoTextEditor = React.createClass({

    saveTimeout: null,

    componentWillMount: function () {
        SceneStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
    },
    getHumanReadableScene: function (scene) {
        // APEP Strip out the IDs so they are not displayed
        var sceneVal = _.omit(scene, ['_id', '_groupID']);
        // APEP Add schema property for monaco editor
        sceneVal.$schema = SCHEMA_URL;
        return sceneVal;
    },

    getSceneStringForSceneObj: function (scene) {
        return JSON.stringify(scene, null, '\t');
    },

    getSceneString: function () {
        var scene = this.getHumanReadableScene(this.state.scene);

        return this.getSceneStringForSceneObj(scene);
    },

    basicSceneSanityChecks: function (editedSceneText) {
        var errors = [];
        var editedScene = {};

        try {
            editedScene = JSON.parse(editedSceneText);
        } catch (ex) {
            errors.push({
                type: "SCENE_PARSE_ISSUE",
                title: "Invalid Scene JSON",
                description: "Warning: ParseEx[ " + ex + "]"
            });
            console.log("basicSceneSanityChecks - errors: ", errors);
            return;
        }

        if (editedScene === {} || Object.keys(editedScene).length < 1) {
            console.log("Cannot look for warnings as no edited scene");
            return;
        }

        var warnings = [];

        var themesAsArray = Object.keys(editedScene.themes);

        if (themesAsArray.length === 0) {
            warnings.push({
                type: "NO_THEMES",
                title: "No Themes",
                description: "Warning: Scene contains no themes, this is not optimal for playback and meta data searching (Graph)."
            });
        }

        var duplicateThemeNames = _.filter(themesAsArray, function (value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });

        console.log("duplicateThemeNames: ", duplicateThemeNames);

        if (duplicateThemeNames.length > 0) {
            warnings.push({
                type: "THEME_DUPLICATION",
                title: "Duplicate themes",
                descriptions: "You have set two themes with the same key (ie theme name), please condense themes into a singular theme or rename one to be unique within the scene"
            });
        }

        console.log("basicSceneSanityChecks - errors: ", errors);
        console.log("basicSceneSanityChecks - warnings: ", warnings);
    },

    getState: function () {
        return {
            scene: null,
            code: null,
            // APEP the history array lets us keep track of every full valid version of scene json
            // when a save happens, we know can tell if the component has seen this and assume the editor is ahead
            // some detailed logic in the update loop gives us this check
            sceneHistory: [],
            focusedMediaObject: null
        };
    },

    getInitialState: function () {
        return this.getState();
    },

    _onChange: function () {
        // console.log("SceneMonacoTextEditor - _onChange [ react based update ]")

        var scene = SceneStore.getScene(this.props._id);

        var sceneVal = this.getHumanReadableScene(scene);
        var code = this.getSceneStringForSceneObj(sceneVal);

        this.setState({scene: scene, code: code})
    },

    // Try get a JSON copy of the scene loaded in editor for comparsion check
    getMonacoEditorVersionOfScene: function () {
        try {
            var newValue = this.refs.monaco.editor.getValue();
            // parse it and see if it blows up
            var newScene = JSON.parse(newValue);
            // make sure that something changed

            // ensure the ids are attached
            newScene._id = this.state.scene._id;
            newScene._groupID = this.state.scene._groupID;

            // APEP remove the schema attribute
            delete newScene.$schema;

            return newScene;
        }
        catch (e) {
            return null;
        }

    },

    saveSceneHistory: function (sceneJsonStringSha1Hash) {
        // APEP avoid filling history, the lower the number the better.
        // APEP ideally should be 1 or 2 to avoid race conditions
        if (this.state.sceneHistory.length > 4)
            this.state.sceneHistory.shift();

        this.state.sceneHistory.push(sceneJsonStringSha1Hash);
    },

    saveJSON: function (newScene) {

        try {

            var mediaWithoutTagOrType = _.filter(newScene.scene, function (sceneObj) {
                return !sceneObj.hasOwnProperty("tags") || !sceneObj.hasOwnProperty("type");
            });

            // APEP check to see if the author is currently typing a new media object by hand
            var shouldSave = mediaWithoutTagOrType.length === 0;

            if (!_.isEqual(this.state.scene, newScene) && shouldSave) {
                // Save a copy of the to be saved new scene, allows the component update cycle to skip updates to avoid race condition for moving cursor post save
                this.saveSceneHistory(sha1(JSON.stringify(newScene)));
                SceneActions.updateScene(newScene);
            }

        } catch (e) {
            if (e instanceof SyntaxError) {
            } else {
                throw e;
            }
        }
    },

    onChange: function (newValue, e) {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);

        this.saveTimeout = setTimeout(() => {
            try {
                if (!this.refs.monaco.editor) {
                    console.log("Nothing to save yet as component not mounted");
                    return;
                }

                this.saveJSON(this.getMonacoEditorVersionOfScene());
            } catch (e) {
                console.log("layout-text-editor failed to extract monaco editor version of scene")
            }
        }, 1000);
    },

    onTextSelection: function (e) {

        var matches = this.refs.monaco.editor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);

        for (var m in matches) {
            var possibleMatch = matches[m].range;

            var selectionRange = new monaco.Range(e.selection.startLineNumber, e.selection.startColumn, e.selection.endLineNumber, e.selection.endColumn);
            var tagRange = new monaco.Range(possibleMatch.startLineNumber, possibleMatch.startColumn, possibleMatch.endLineNumber, possibleMatch.endColumn);

            var isInTags = monaco.Range.containsRange(tagRange, selectionRange);

            if (isInTags)
                SceneActions.changeMediaObjectFocus(parseInt(m), true);
        }
    },

    onChangeCursorPosition: function (e) {
        // console.log("MONACO - On Cursor Position: ", e);
    },

    editorWillMount: function (m) {
        try {
            m.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [{
                    uri: SCHEMA_URL,
                    schema: {
                        title: "Media Scene",
                        description: "A document representing a collection of media assets and their tags",
                        type: "object",
                        properties: {
                            _id: {
                                type: "string",
                                description: "Scene Identifier"
                            },
                            name: {
                                type: "string",
                                description: "human readable name to refer to the scene by"
                            },
                            "isLinear": {
                                "type": "string",
                                "description": "Is Linear allows media to be sequenced by number, use sequenceByNumber as value",
                                "enum": ["sequenceByNumber"]
                            },
                            "isLinearOptions": {
                                "type": "string",
                                "description": "The isLinear playback rules",
                                'enum': ["playOnlySequencedMedia", "playRemainingMedia", "playAllMedia"]
                            },
                            "forceFullSequencePlayback": {
                                "type": "Boolean",
                                "description": "Force sequences to fully play before displaying the next",
                                "enum": [true, false]
                            },
                            "displayDuration": {
                                "description": "How many seconds atemporal assets should be on the screen for",
                                "type": "number"
                            },
                            "displayInterval": {
                                "description": "How many seconds should be between the showing of assets on the screen",
                                "type": "number"
                            },
                            "transitionDuration": {
                                "description": "How many seconds it should take for an asset to appear/disappear from the screen",
                                "type": "number"
                            },
                            "maximumOnScreen": {
                                "description": "maximum counts of media types allowed on the screen at one time",
                                "type": "object",
                                "properties": {
                                    "image": {
                                        "type": "integer"
                                    },
                                    "text": {
                                        "type": "integer"
                                    },
                                    "video": {
                                        "type": "integer"
                                    },
                                    "audio": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "themes": {
                                "description": "represents sets of tags bundled together to make a coherent theme. Each property represents a singular theme.",
                                "type": "object",
                                "additionalProperties": {
                                    "description": "Comma seperated list of tags that belong to this theme.",
                                    "type": "string"
                                }
                            },
                            "scene": {
                                "description": "a collection of objects representing the various assets of a scene",
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "_id": {
                                            "description": "unique identifier for this scene",
                                            "type": "string"
                                        },
                                        "url": {
                                            "description": "Url pointing to media asset if neccessary. Used for images, video, and audio.",
                                            "type": "string"
                                        },
                                        "text": {
                                            "description": "Text to display for text media asset.",
                                            "type": "string"
                                        },
                                        "type": {
                                            "description": "Kind of media it is (only 'image', 'text', 'video', and 'audio' is supported)",
                                            "type": "string"
                                        },
                                        "tags": {
                                            "description": "Semantic tags for this asset, comma seperated",
                                            "type": "string"
                                        },
                                        "style": {
                                            "description": "Apply visual CSS rules",
                                            "type": "object"
                                        }
                                    },
                                    "required": ["_id", "type", "tags"]
                                }
                            }
                        }
                    }
                }]
            });
        } catch (e) {
            console.log("Monaco - editorWillMount - e: ", e)
        }
    },

    onDidMount: function (editor, monaco) {
        // console.log('MONACO - onDidMount', editor);

        editor.addAction({
            // An unique identifier of the contributed action.
            id: 'copy-command',

            // A label of the action that will be presented to the user.
            label: 'Copy Selection',

            // An optional array of keybindings for the action.
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C],

            keybindingContext: null,

            contextMenuGroupId: 'navigation',

            contextMenuOrder: 1.5,

            // Method that will be executed when the action is triggered.
            run: function (ed) {
                var successful = document.execCommand('copy');

                // APEP TODO we can give the user an error toastr if the execCommand fails

                return null;
            }
        });

        editor.focus();

        // APEP we need to try setup state correctly after mounting.
        // APEP this helps if a scene is selected before this component is mounted.
        this._onChange();

        // this.refs.monaco.editor.onDidChangeCursorPosition(this.onChangeCursorPosition);
        this.refs.monaco.editor.onDidChangeCursorSelection(this.onTextSelection)
    },

    shouldComponentUpdate: function (nextProps, nextState) {

        //APEP This needs reviewing, I've commented it out, as I don't think it's strictly necessary
        // if (!this.state.scene) {
        //     return true;
        // }

        if (!_.isEqual(nextProps.focusedMediaObject, this.props.focusedMediaObject)) {
            return true;
        }

        // APEP if we do not have a ref to the editor in the DOM.  We must force an update to mount the editor again.
        // This is for when the editor has been dismounted.
        // Forcing this update triggers the remounting for the editor, giving us the DOM ref again.
        if (!this.refs.monaco.editor) {
            return true;
        }

        // APEP pruned an equals check, considering we handle all situations in didUpdate, we may as well allow the update
        return true;
    },

    componentDidUpdate: function (previousProps, previousState) {

        try {
            // APEP see if the new state for the scene has changed
            let latestStateHash = sha1(JSON.stringify(this.state.scene));

            let isNotLastSeenInHistory = _.filter(this.state.sceneHistory, (id) => {
                return id === latestStateHash
            }).length === 0;

            let isDifferentScene = true;
            if (previousState.scene && this.state.scene) {
                isDifferentScene = previousState.scene._id !== this.state.scene._id;
            }

            var sceneChangeShouldUpdate = isDifferentScene || isNotLastSeenInHistory;

            // APEP check the monaco editor to see if it already has a value set.
            var emptyEditorShouldUpdate = this.refs.monaco.editor.getValue() === null || this.refs.monaco.editor.getValue().length === 0;

            // APEP if the scene state has changed, or the editor has no string set, we should set the value in the component.
            if (sceneChangeShouldUpdate || emptyEditorShouldUpdate) {

                // APEP put in history that we've seen this change
                this.saveSceneHistory(latestStateHash);

                // APEP after updating, make sure we update the monaco editor
                this.refs.monaco.editor.setValue(this.getSceneString());
            }
        } catch (e) {
            console.log("Error with bad json: ", e);
        }


        if (this.props.focusedMediaObject !== previousProps.focusedMediaObject) {

            var matches = this.refs.monaco.editor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);
            var match = matches[this.props.focusedMediaObject];

            if (!match) {
                console.log("No selection for media object available");
                return;
            }

            // APEP only set the position and focus of the text editor if the focus event has not come from the editor itself.
            if (!this.props.focusFromMonacoEditor) {
                this.refs.monaco.editor.setPosition(match.range.getStartPosition());
                this.refs.monaco.editor.revealPosition(match.range.getStartPosition());
            }
        }

    },

    render: function () {

        var options = {
            selectOnLineNumbers: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            folding:true,
            showFoldingControls:'always',
            matchBracket:true,
            lightbulb:{
                enabled:true
            },
            minimap:{
                enabled:false
            }
        };

        var requireConfig = {
            url: 'external/require.js',
            paths: {
                'vs': 'monaco-editor/min/vs'
            }
        };

        return (
            <div className="scene-text-editor">
                <MonacoEditor
                    ref="monaco"
                    width="100%"
                    height="100%"
                    language="json"
                    options={options}
                    requireConfig={requireConfig}
                    onChange={this.onChange}
                    editorDidMount={this.onDidMount}
                    editorWillMount={this.editorWillMount}
                    theme="vs-dark"
                />
            </div>
        );
    }

});

module.exports = SceneMonacoTextEditor;
