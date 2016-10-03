'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneActions = require('../actions/scene-actions');
var SceneList = require('./scene-list.jsx');
var _ = require('lodash');

var monacoEditor = undefined;

var SceneMonacoTextEditor = React.createClass({

    getHumanReadableScene: function() {
        console.log("getHumanReadableScene: ", this.props);

        return this.props.scene; //TODO _.omit _id
    },

    getSceneStringForSceneObj: function(scene) {
        return JSON.stringify(scene, null, 2);
    },

    getSceneString: function() {
        var scene = this.getHumanReadableScene();

        return JSON.stringify(scene, null, 2);
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

            if(!monacoEditor) {
                console.log("Nothing to save yet as component not mounted");
                return;
            }

            try {
                var newValue = monacoEditor.getValue();
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
        var saveTimeout;

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(this.saveJSON(false), 1000);
    },


    onDidMount: function(editor, monaco) {
        console.log('MONACO - onDidMount', editor);

        editor.focus();

        monacoEditor = editor;

        monacoEditor.setValue(this.getInitialState().code);

        // monacoEditor.onDidChangeCursorPosition(function(e){
        //     console.log(e);
        // });
        //
        // monacoEditor.onDidChangeCursorSelection(this.onTextSelection)
    },

    componentDidUpdate: function(previousProps, previousState) {
        console.log("MONACO - componentDidUpdate");

        //TODO check if any errors

        try {
            var editorScene = JSON.parse(monacoEditor ? monacoEditor.getValue() : "{}"); //TODO might need changing

            console.log("MONACO - componentDidUpdate - editorScene: ", editorScene);

            if(! _.isEqual(editorScene, this.getHumanReadableScene())) {
                monacoEditor.setValue(this.getSceneString()); //CHECK if we should set document to new json
            } 
        } catch (e) {
            console.log("Error with bad json: ", e);
        }


        if(this.props.focusedMediaObject !== previousProps.focusedMediaObject) {
            var sceneMediaObjectRegex = /{.*tags.*type.*\},/i;

            //TODO APEP: Github issue raised about issue with regex.
            //TODO APEP: https://github.com/Microsoft/monaco-editor/issues/216
            // sceneMediaObjectRegex = /tags(.|[\s\S])*type/g;

            //{[\s\S]{1,10}tags.*[\s\S]*?type[\s\S]*?}[\s\S]*?}

            // sceneMediaObjectRegex = /{[\s\S]{1,10}tags.*[\s\S]*?type[\s\S]*?}[\s\S]*?}/g;

            // sceneMediaObjectRegex = /tags.*?type/g;

            sceneMediaObjectRegex = /tags[\s\S]*?cook/;

            var matches = monacoEditor.getModel().findMatches(sceneMediaObjectRegex, false, true, false, false);

            console.log("MATCHES: " , matches);

            //TODO try focus here

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
