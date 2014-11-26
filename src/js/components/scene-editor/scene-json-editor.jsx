'use strict';

var React = require('react/addons');
var SceneStore = require('../../stores/scene-store');
var SceneActions = require('../../actions/scene-actions');

function getScene() {
    return {json: JSON.stringify(SceneStore.getScene(), null, '\t')};
}

var SceneJsonEditor = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState:function(){
        return getScene();
    },

    componentWillMount:function(){
        SceneStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(getScene());
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