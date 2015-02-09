'use strict';

var React = require('react');
var SceneActions = require('../actions/scene-actions');
var _ = require('lodash');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/selection/active-line');
var codemirror = require('codemirror');


function stringify(value) {
    return JSON.stringify(value, undefined, '\t');
}

function nthIndexOf(str, pattern, n, start) {
    var i = start || -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

/** Function count the occurrences of substring in a string;
 * @param {String} string   Required. The string;
 * @param {String} subString    Required. The string to search for;
 * @param {Boolean} allowOverlapping    Optional. Default: false;
 */
function occurrences(string, subString, allowOverlapping){

    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
}

var SceneTextEditor = React.createClass({

    getSceneString: function() {
        return stringify(this.props.scene);
    },

    getInitialState: function() {
        return {
            error: null
        };
    },

    saveJSON: function() {
        return function() {
            try {
                var newValue = this.document.getValue();
                // parse it and see if it blows up
                var newScene = JSON.parse(newValue);
                // make sure that something changed
                if (! _.isEqual(this.props.scene, newScene)) {
                    SceneActions.updateScene(newScene);    
                } 
                this.setState({error: null});
                
            } catch (e) {
                if (e instanceof SyntaxError) {
                    this.setState({error: e.message});
                } else {
                    throw e;
                }
            }
        }.bind(this);
    },

    componentDidMount: function() {
        this.document = codemirror(this.getDOMNode(), {
            value: this.getSceneString(),
            lineWrapping: true,
            mode:  'application/json',
            styleActiveLine: true
        });
        
        this.document.on('blur', this.saveJSON(true));

        var saveTimeout;
        this.document.on('change', function(cm, changeObj) {
            // change gets called for anychange, so ignore programatic changes
            if (changeObj.origin !== 'setValue') {
                if (saveTimeout) clearTimeout(saveTimeout);

                saveTimeout = setTimeout(this.saveJSON(false), 1000);    
            }
        }.bind(this));
    },

    componentDidUpdate: function(prevProps, prevState) {

        if (! this.state.error) {
            try {
                var curScene = JSON.parse(this.document.getValue());
                if (! _.isEqual(curScene, this.props.scene)) {
                    this.document.setValue(this.getSceneString());
                }

            } catch(e) {
                // do nothing, just ignore updates when we have bad json
            }    
        }
        
        
        if (this.props.focusedMediaObject !== prevProps.focusedMediaObject) {
            var jsonStr = this.document.getValue();
            // get index of scene property in json
            var sceneStr = '"scene": [';
            var startSearch = jsonStr.indexOf(sceneStr);
            if (startSearch === -1) {
                throw "cannot location scene property in json string";
            }

            var openBracketIndex = nthIndexOf(jsonStr, '\t\t{', this.props.focusedMediaObject+1, startSearch);
            if (openBracketIndex === -1) {
                throw "cannot locate requested open bracket";
            }
            
            jsonStr = jsonStr.substring(0, openBracketIndex);
            var lines = occurrences(jsonStr, '\n');

            this.document.setCursor(lines + 1, 3);

            if (! this.document.hasFocus()) this.document.focus();  
        }
    },

    render: function() {
        var klass = 'scene-text-editor ' + (this.state.error ? ' has-error' : '');
        return (
            <div className={klass}>
                <div className='error-message'>{this.state.error}</div>
            </div>
        );
    }

});

module.exports = SceneTextEditor;