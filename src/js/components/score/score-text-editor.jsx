'use strict';

var React = require('react');
var _ = require('lodash');
var MonacoEditor = require('react-monaco-editor').default;
var HubClient = require('../../utils/HubClient');

var exampleScore = {
    "play": {
        "themes": ["one"],
        "scenes": ["scene _id"]
    }
};

var ScoreTextEditor = React.createClass({

    getJsonObjectAsString: function(obj) {
        return JSON.stringify(obj, null, '\t');
    },

    onChange: function(newValue, e) {
    },

    onDidMount: function(editor, monaco) {
        editor.focus();

        // APEP set the monaco editor to a basic score object
        this.refs.monaco.editor.setValue(this.getJsonObjectAsString(exampleScore));
    },

    editorWillMount: function(m) { },

    playScore: function(e) {
        var playerRoomId = this.refs.playerRoom.value;

        // console.log("Score-Text-Editor - playerRoomId: ", playerRoomId);

        var scoreFromEditorText = this.refs.monaco.editor.getValue();

        var scoreFromEditor = JSON.parse(scoreFromEditorText);

        console.log("Score-Text-Editor - scoreFromEditor: ", scoreFromEditor);

        HubClient.publishScoreCommand(scoreFromEditor, playerRoomId);
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
            <div className="score-editor-container">

                <div className="row">
                    <div className="col-lg-10">
                        <div className="input-group">
                            <span className="input-group-addon">Player Room</span>
                            <input type="text" className="form-control" placeholder="presentation" ref="playerRoom" />
                        </div>
                    </div>

                    <div className="col-lg-2">
                        <button className="btn btn-primary btn-lg" onClick={this.playScore}>
                            RUN
                        </button>
                    </div>
                </div>

                <MonacoEditor
                    ref="monaco"
                    width="500"
                    height="500"
                    language="json"
                    options={options}
                    requireConfig={requireConfig}
                    onChange={this.onChange}
                    editorDidMount={this.onDidMount}
                    editorWillMount={this.editorWillMount}
                    theme="vs-dark"
                />
            </div>
        )
    }
});

module.exports = ScoreTextEditor;
