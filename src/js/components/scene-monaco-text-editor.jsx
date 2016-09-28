'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneList = require('./scene-list.jsx');

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

    getInitialState: function() {

        console.log("getInitialState done");

        return {
            code: this.getSceneString()
        };
    },

    _onChange: function() {
        console.log("SceneMonacoTextEditor - _onChange");

        this.setState(this.getInitialState());
        // monacoEditor.smartIndent();
    },

    onChange: function(newValue, e) {
        console.log('MONACO - onChange for actual editor', newValue, e);

        //console.log("monacoEditor: ", monacoEditor);

        //console.log('editor selections', monacoEditor.getSelection());
    },

    onTextSelection: function(e) {
        console.log("On Text Selection: ", e);
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

    onDidUpdate: function(previousProps, previousState) {
        console.log("MONACO - onDidUpdate");

        this._onChange();
    },

    componentDidUpdate: function(previousProps, previousState) {
        console.log("MONACO - componentDidUpdate");

        this._onChange();
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
