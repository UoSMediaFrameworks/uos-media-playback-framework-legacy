'use strict';

var React = require('react/addons');
var SceneActions = require('../actions/scene-actions');


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
        console.log('json componentWillMount', this.getSceneJson());
        this.setState({json: this.getSceneJson()});
    },

    componentWillReceiveProps: function(nextProps) {
        console.log('json componentWillReceiveProps', nextProps);
        this.setState({json: this.stringify(nextProps.scene)});
    },
    
    handleBlur: function(event) {
        try {
            var newScene = JSON.parse(event.target.value);
            this.setState({error: false});
            SceneActions.sceneChange(newScene);
        } catch (e) {
            if (e instanceof SyntaxError) {
                this.setState({error: true});
            } else {
                throw e;
            }
        }
    },

    render: function() {
        var groupClass = 'form-group' + (this.state.error ? ' has-error' : '');
        return (
            <div className={groupClass}>
                <textarea
                 className='form-control' 
                 onBlur={this.handleBlur}
                 valueLink={this.linkState('json')}>
                </textarea>
            </div>    
        );
    }

});

module.exports = SceneJsonEditor;