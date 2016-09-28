'use strict';

var React = require('react');
var MonacoEditor = require('react-monaco-editor').default;
var SceneList = require('./scene-list.jsx');

var monacoEditor = undefined;

var testScene = {
    "_id" : "5798a3aa50c8c5dbb1c9867b",
    "name" : "TestDemo",
    "maximumOnScreen" : {
        "image" : 4,
        "text" : 2,
        "video" : 4,
        "audio" : 4
    },
    "displayDuration" : 3,
    "displayInterval" : 0.2,
    "transitionDuration" : 1.4,
    "themes" : {
        "Hawkers" : "chef, cooking, holler, hawker, vendor, voice, chinese, seller",
        "Customers" : "children, family, select, friends, buyer, crowd, eating",
        "Props" : "stall, bell, coconut, dessert, flag, food, fruits, hat, meat, music, satay, signange"
    },
    "style" : {
        "backgroundColor" : "black"
    },
    "scene" : [
        {
            "tags" : "cooking, food, family, chef",
            "type" : "audio",
            "volume" : 20,
            "url" : "https://soundcloud.com/user-297728422/fe-snd-001?in=user-297728422/sets/mmu_hawkers",
            "_id" : "578eb6d0be206e480c28712b",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "family, crowd, seller, stall",
            "type" : "audio",
            "volume" : 20,
            "url" : "https://soundcloud.com/user-297728422/fe-snd-002?in=user-297728422/sets/mmu_hawkers",
            "_id" : "578eb6d0be206e480c28712c",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "eating, crowd, music",
            "type" : "audio",
            "volume" : 20,
            "url" : "https://soundcloud.com/user-297728422/fe-snd-003?in=user-297728422/sets/mmu_hawkers",
            "_id" : "578eb6d0be206e480c28712d",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "bell, hawker, seller, crowd",
            "type" : "audio",
            "volume" : 20,
            "url" : "https://soundcloud.com/user-297728422/fe-snd-004?in=user-297728422/sets/mmu_hawkers",
            "_id" : "578eb6d0be206e480c28712e",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "bell, hawker, seller, crowd, family",
            "type" : "audio",
            "volume" : 20,
            "url" : "https://soundcloud.com/user-297728422/fe-snd-005?in=user-297728422/sets/mmu_hawkers",
            "_id" : "578eb6d0be206e480c28712f",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "hawker, fruits, flag",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/3b88329a806aa24328b7b37817ae4593/fe-img-084.JPG",
            "_id" : "578eb6d0be206e480c287130",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "hawker, buyer, select, satay, meat",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/479d6d9220c650bc7555bdc71f0c9b94/fe-img-082.JPG",
            "_id" : "578eb6d0be206e480c287131",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "hawker, seller, buyer, select",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/69aba743a371471067dd2384175aaecd/fe-img-083.JPG",
            "_id" : "578eb6d0be206e480c287132",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "coconut, hawker, seller, buyer, signage, crowd",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/af2fdc8e332c656ce6d5da12e164eb1c/fe-img-011.JPG",
            "_id" : "578eb6d0be206e480c287133",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "crowd, family, friends, eating",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/f93201f4a38acd4b6f75ee27ed8fdeef/fe-img-007.JPG",
            "_id" : "578eb6d0be206e480c287134",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "stall, coconut, seller, buyer, hawker",
            "type" : "image",
            "url" : "https://uosassetstore.blob.core.windows.net/assetstoredev/89df2b7dc0680f2606c69b95ed7e6514/fe-vid-081.JPG",
            "_id" : "578eb6d0be206e480c287135",
            "style" : {
                "z-index" : "400",
                "border" : "15px solid white"
            }
        },
        {
            "tags" : "crowd, chinese, hat, seller, food ",
            "type" : "video",
            "volume" : 100,
            "url" : "https://vimeo.com/175459949",
            "_id" : "578ec1a2be206e480c287151",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "hawker, crowd, food, eating, family",
            "type" : "video",
            "volume" : 100,
            "url" : "https://vimeo.com/175459948",
            "_id" : "578ec1a2be206e480c287152",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "hawker, seller, crowd, dessert, children",
            "type" : "video",
            "volume" : 100,
            "url" : "https://vimeo.com/175459947",
            "_id" : "578ec1a2be206e480c287153",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "vendor, fruits, crowd, seller",
            "type" : "video",
            "volume" : 100,
            "url" : "https://vimeo.com/175459944",
            "_id" : "578ec1a2be206e480c287154",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : " dessert, bell, voice, crowd, holler ",
            "type" : "video",
            "volume" : 100,
            "url" : "https://vimeo.com/175460721",
            "_id" : "578ec1a2be206e480c287155",
            "style" : {
                "z-index" : "1"
            }
        },
        {
            "tags" : "",
            "type" : "text",
            "text" : "test",
            "style" : {
                "z-index" : "100"
            },
            "_id" : "57e1b8871b196a054287f77b"
        },
        {
            "tags" : "",
            "type" : "text",
            "text" : "This is a test, This is a test, This is a test, This is a test,This is a test",
            "style" : {
                "z-index" : "250",
                "color" : "green"
            },
            "_id" : "57e1b8871b196a054287f77c"
        }
    ],
    "_groupID" : 101
};

var testSceneForEditor = JSON.stringify(testScene);//.join('\n');

testSceneForEditor = JSON.stringify(testScene, null, 2);

var SceneMonacoTextEditor = React.createClass({

    getInitialState: function() {
        return {
            code: testSceneForEditor
        };
    },


    componentDidMount: function() {
        console.log("test");
    },

    _onChange: function() {
        console.log("test");
        // monacoEditor.smartIndent();
    },

    onChange: function(newValue, e) {
        console.log('onChange', newValue, e);

        console.log("monacoEditor: ", monacoEditor);

        console.log('editor selections', monacoEditor.getSelection());
    },

    onTextSelection: function(e) {
        console.log("On Text Selection: ", e);


    },

    onDidMount: function(editor, monaco) {
        console.log('onDidMount', editor);

        editor.focus();

        monacoEditor = editor;

        monacoEditor.onDidChangeCursorPosition(function(e){
            console.log(e);
        });

        monacoEditor.onDidChangeCursorSelection(this.onTextSelection)
    },

    render: function() {

        var options = {
            selectOnLineNumbers: true
        };

        var requireConfig = {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
            paths: {
                'vs': 'https://as.alipayobjects.com/g/cicada/monaco-editor-mirror/0.6.1/min/vs'
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
