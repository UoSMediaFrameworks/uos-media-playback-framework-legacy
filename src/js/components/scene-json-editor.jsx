'use strict';
/* jshint browser: true */

var React = require('react/addons');
var SceneActions = require('../actions/scene-actions');
var _ = require('lodash');

// cross browser means of setting cursor position in a textarea
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        if (input !== document.activeElement) {
            input.focus();
        }
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
        range.scrollIntoView(true);
    }
}

function nthIndexOf(str, pattern, n, start) {
    var i = start || -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}


var SceneJsonEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    stringify: function(value) {
        return JSON.stringify(value, undefined, '\t');
    },

    getSceneJson: function() {
        return this.stringify(this.props.scene);
    },

    getInitialState:function(){
        return {error: false, json: this.getSceneJson()};
    },

    componentWillMount: function() {
        this.setState({json: this.getSceneJson()});
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            json: this.stringify(nextProps.scene),
        });
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.focusedMediaObject !== prevProps.focusedMediaObject) {
            console.log('running update to ' + this.props.focusedMediaObject);
            // get index of scene property in json
            var sceneStr = '"scene": [';
            var startSearch = this.state.json.indexOf(sceneStr);
            if (startSearch === -1) {
                throw "cannot location scene property in json string";
            }

            var openBracketIndex = nthIndexOf(this.state.json, '\t\t{', this.props.focusedMediaObject+1, startSearch);
            if (openBracketIndex === -1) {
                throw "cannot locate requested open bracket";
            }
            openBracketIndex += '\t\t{\n\t\t\t'.length;
            setSelectionRange(this.getDOMNode(), openBracketIndex, openBracketIndex);
        }
    },
    
    handleBlur: function(event) {
        try {
            var newScene = JSON.parse(event.target.value);

            // make sure that something changed
            if (! _.isEqual(newScene, this.props.scene)) {

                this.setState({error: false});
                SceneActions.updateScene(newScene);    
            }
            
        } catch (e) {
            if (e instanceof SyntaxError) {
                this.setState({error: true});
            } else {
                throw e;
            }
        }
    },

    render: function() {
        // deduce position of cursor for 
        var groupClass = this.props.className + ' form-control json-textarea' + (this.state.error ? ' has-error' : '');
        return (
            
                <textarea
                 className={groupClass} 
                 onBlur={this.handleBlur}
                 valueLink={this.linkState('json')}>
                </textarea>
            
        );
    }

});

module.exports = SceneJsonEditor;