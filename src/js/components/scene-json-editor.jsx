'use strict';

var React = require('react/addons');
var SceneActions = require('../actions/scene-actions');
var _ = require('lodash');


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
        this.setState({json: this.stringify(nextProps.scene)});
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