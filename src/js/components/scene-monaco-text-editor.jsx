'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneActions = require('../actions/scene-actions');
var SceneList = require('./scene-list.jsx');
var _ = require('lodash');

var saveTimeout;  //APEP global timeout variable to allow us storage the id for clear intervals.

var SceneMonacoTextEditor = React.createClass({

    getHumanReadableScene: function() {
        console.log("getHumanReadableScene: ", this.props);

        return this.props.scene; //TODO _.omit _id
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
        console.log("getInitialState done");

        return this.getState();
    },

    _onChange: function() {
        console.log("SceneMonacoTextEditor - _onChange [ react based update ]");
    },

    onTextSelection: function(e) {
        console.log("On Text Selection: ", e);
    },

    saveJSON: function() {
        return function() {

            if(!this.refs.monaco.editor) {
                console.log("Nothing to save yet as component not mounted");
                return;
            }

            try {
                var newValue = this.refs.monaco.editor.getValue();
                // parse it and see if it blows up
                var newScene = JSON.parse(newValue);
                // make sure that something changed

                var shouldSave = false;
                _.forEach(this.props.scene.scene, function(sceneObj){
                    if(!shouldSave) {
                        shouldSave = ! sceneObj.hasOwnProperty("_id");
                    }
                });


                if (! _.isEqual(this.props.scene, newScene) || shouldSave) { //TODO ensure a save occurs for scene media without id - must update view with _id
                    SceneActions.updateScene(newScene);
                }

                //this.setState({error: null});

            } catch (e) {
                if (e instanceof SyntaxError) {
                    //this.setState({error: e.message});
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


    onDidMount: function(editor, monaco) {
        console.log('MONACO - onDidMount', editor);

        editor.focus();

        //APEP work in process awaiting github issue for language support
        // this.refs.monaco.editor.languages.json.jsonDefaults.setDiagnosticsOptions({
        //     schemas: [{
        //         schema: {
        //             type: "object",
        //             properties: {
        //                 _id: {
        //                     type: "string",
        //                     description: "Scene Identifier"
        //                 },
        //                 name: {
        //                     type: "string",
        //                     description: "Scene Name"
        //                 }
        //             }
        //         }
        //     }]
        // });

        this.refs.monaco.editor.setValue(this.getInitialState().code);

        // this.refs.monaco.editor.onDidChangeCursorPosition(function(e){
        //     console.log(e);
        // });
        //
        // this.refs.monaco.editor.onDidChangeCursorSelection(this.onTextSelection)
    },

    componentDidUpdate: function(previousProps, previousState) {
        console.log("MONACO - componentDidUpdate");

        //TODO check if any errors
        try {
            var editorScene = JSON.parse(this.refs.monaco.editor ? this.refs.monaco.editor.getValue() : "{}"); //TODO might need changing

            console.log("MONACO - componentDidUpdate - editorScene: ", editorScene);

            if(! _.isEqual(editorScene, this.getHumanReadableScene())) {
                this.refs.monaco.editor.setValue(this.getSceneString()); //CHECK if we should set document to new json
            }
        } catch (e) {
            console.log("Error with bad json: ", e);
        }


        if(this.props.focusedMediaObject !== previousProps.focusedMediaObject) {
            var sceneMediaObjectRegex = "tags[\\s\\S\\n]*?type";

            //TODO APEP: Github issue raised about issue with regex. https://github.com/Microsoft/monaco-editor/issues/216
            sceneMediaObjectRegex = "{[\\s\\S\\n]{1,10}tags[\\s\\S\\n]*?type[\\s\\S\\n]*?}[\\s\\S\\n]*?}"; //Full media object selection

            var matches = this.refs.monaco.editor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);
            var match = matches[this.props.focusedMediaObject];
            this.refs.monaco.editor.setPosition(match.getStartPosition());
            this.refs.monaco.editor.revealPosition(match.getStartPosition());
            this.refs.monaco.editor.setSelection(match);

        }
    },

    render: function() {

        var options = {
            selectOnLineNumbers: true
        };

        var requireConfig = {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
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
                    value={this.state.code}
                    options={options}
                    requireConfig={requireConfig}
                    onChange={this.onChange}
                    onDidMount={this.onDidMount}
                    theme="vs-dark"
                />
            </div>

        );
    }

});

module.exports = SceneMonacoTextEditor;
