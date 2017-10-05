'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneActions = require('../actions/scene-actions');
var SceneList = require('./scene-list.jsx');
var _ = require('lodash');

var saveTimeout;  //APEP global timeout variable to allow us storage the id for clear intervals.

//TODO APEP: Github issue raised about issue with regex. https://github.com/Microsoft/monaco-editor/issues/216
var sceneMediaObjectRegex = "{[\\s\\S\\n]{1,10}tags[\\s\\S\\n]*?type[\\s\\S\\n]*?[\\s\\S\\n]}"; //APEP Full media object selection
var SCHEMA_URL = window.location.origin + "/schemas/scene-schema.json"; // "http://mediaframework.salford.ac.uk/schemas/scene-schema.json";

// APEP This file seems redundent / not used within the grid layout application.  We should follow the dependencies through and clean up
var SceneMonacoTextEditor = React.createClass({

    getHumanReadableScene: function() {
        // APEP Strip out the IDs so they are not displayed
        var sceneVal = _.omit(this.props.scene, ['_id', '_groupID']);
        // APEP Add schema property for monaco editor
        sceneVal.$schema = SCHEMA_URL;
        return sceneVal;
    },

    getSceneStringForSceneObj: function(scene) {
        return JSON.stringify(scene, null, '\t');
    },

    getSceneString: function() {
        var scene = this.getHumanReadableScene();

        return this.getSceneStringForSceneObj(scene);
    },

    basicSceneSanityChecks: function(editedSceneText) {
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

        if(editedScene === {} || Object.keys(editedScene).length < 1) {
            console.log("Cannot look for warnings as no edited scene");
            return;
        }

        var warnings = [];

        var themesAsArray = Object.keys(editedScene.themes);

        if(themesAsArray.length === 0) {
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

        if(duplicateThemeNames.length > 0) {
            warnings.push({
                type: "THEME_DUPLICATION",
                title: "Duplicate themes",
                descriptions: "You have set two themes with the same key (ie theme name), please condense themes into a singular theme or rename one to be unique within the scene"
            });
        }

        console.log("basicSceneSanityChecks - errors: ", errors);
        console.log("basicSceneSanityChecks - warnings: ", warnings);
    },


    getState: function() {
        return {
            scene: this.props.scene,
            code: this.getSceneString(),
            focusedMediaObject: this.props.focusedMediaObject
        };
    },

    getInitialState: function() {
        return this.getState();
    },

    _onChange: function() {
        // console.log("SceneMonacoTextEditor - _onChange [ react based update ]");
    },

    handleSceneJSONSave: function(saved) {
        this.props.sceneSavingHandler(saved);
    },

    // Try get a JSON copy of the scene loaded in editor for comparsion check
    getMonacoEditorVersionOfScene: function() {
        try {
            var newValue = this.refs.monaco.editor.getValue();
            // parse it and see if it blows up
            var newScene = JSON.parse(newValue);
            // make sure that something changed

            // ensure the ids are attached
            newScene._id = this.props.scene._id;
            newScene._groupID = this.props.scene._groupID;

            // APEP remove the schema attribute
            delete newScene.$schema;

            return newScene;
        }
        catch (e) {
            return null;
        }

    },

    saveJSON: function() {
        return function() {

            if(!this.refs.monaco.editor) {
                console.log("Nothing to save yet as component not mounted");
                return;
            }

            try {

                this.handleSceneJSONSave(false);

                var newScene = this.getMonacoEditorVersionOfScene();

                var mediaWithoutTagOrType = _.filter(newScene.scene, function(sceneObj){
                    return !sceneObj.hasOwnProperty("tags") || !sceneObj.hasOwnProperty("type");
                });

                var shouldSave = mediaWithoutTagOrType.length === 0;

                if (!_.isEqual(this.props.scene, newScene) || shouldSave) { //TODO ensure a save occurs for scene media without id - must update view with _id
                    SceneActions.updateScene(newScene);
                    this.handleSceneJSONSave(true);
                }

            } catch (e) {
                if (e instanceof SyntaxError) {
                } else {
                    throw e;
                }
            }
        }.bind(this);
    },

    onChange: function(newValue, e) {
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(this.saveJSON(false), 1000);
    },

    // APEP temp solution for saves to only be conducted with the user initiation of the save
    // onSaveClick: function(e) {
    //     this.saveJSON()()
    // },

    onTextSelection: function(e) {
        // console.log("MONACO - On Text Selection: ", e);


        var matches = this.refs.monaco.editor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);

        for(var m in matches) {
            var possibleMatch = matches[m];

            var selectionRange = new monaco.Range(e.selection.startLineNumber, e.selection.startColumn, e.selection.endLineNumber, e.selection.endColumn);
            var tagRange = new monaco.Range(possibleMatch.startLineNumber, possibleMatch.startColumn, possibleMatch.endLineNumber, possibleMatch.endColumn );

            var isInTags = monaco.Range.containsRange(tagRange, selectionRange);

            if(isInTags)
                this.props.focusHandler(parseInt(m));
        }

    },

    onChangeCursorPosition: function(e) {
        // console.log("MONACO - On Cursor Position: ", e);
    },

    editorWillMount: function(m) {
        try {
            m.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate:true,
                schemas: [{
                    uri: SCHEMA_URL,
                    schema: {
                        type: "object",
                        properties: {
                            _id: {
                                type: "string",
                                description: "Scene Identifier"
                            },
                            name: {
                                type: "string",
                                description: "Scene Name"
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
                                "enum": [ true, false ]
                            }

                        }
                    }
                }]
            });
        } catch (e) {
            console.log("Monaco - editorWillMount - e: ", e)
        }
    },

    onDidMount: function(editor, monaco) {
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
            run: function(ed) {
                var successful = document.execCommand('copy');

                // APEP TODO we can give the user an error toastr if the execCommand fails

                return null;
            }
        });

        editor.focus();

        this.refs.monaco.editor.setValue(this.getInitialState().code);

        // this.refs.monaco.editor.onDidChangeCursorPosition(this.onChangeCursorPosition);
        //
        // this.refs.monaco.editor.onDidChangeCursorSelection(this.onTextSelection)
    },

    shouldComponentUpdate: function(nextProps, nextState) {

        if(!this.state.scene) {
            return true;
        }

        if(! _.isEqual(nextProps.focusedMediaObject, this.props.focusedMediaObject)) {
            return true;
        }

        if(!this.refs.monaco.editor) {
            return true;
        }


        // Check if the scene in the next props is the same as the editor copy
        // If so the editor initiated the change and does not need a component update
        // If the component does update it can cause the cursor to lose position in editor (bad UX)
        return !_.isEqual(nextProps.scene, this.getMonacoEditorVersionOfScene());
    },

    componentDidUpdate: function(previousProps, previousState) {
        console.log("MONACO - componentDidUpdate");

        try {
            if(! _.isEqual(this.props.scene, previousProps.scene))
                this.refs.monaco.editor.setValue(this.getSceneString());
        } catch (e) {
            console.log("Error with bad json: ", e);
        }


        if(this.props.focusedMediaObject !== previousProps.focusedMediaObject) {

            var matches = this.refs.monaco.editor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);
            var match = matches[this.props.focusedMediaObject];

            if(!match) {
                console.log("No selection for media object available");
                return;
            }
            this.refs.monaco.editor.setPosition(match.getStartPosition());
            this.refs.monaco.editor.revealPosition(match.getStartPosition());
        }
    },

    componentWillUnmount: function() {
        if (saveTimeout) clearTimeout(saveTimeout);
    },

    render: function() {

        var options = {
            selectOnLineNumbers: true,
            automaticLayout:true,
            scrollBeyondLastLine:false
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
