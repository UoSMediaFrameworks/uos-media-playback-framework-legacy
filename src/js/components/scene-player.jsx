var React = require('react');
var SceneStore = require('../stores/scene-store');

function getScene() {
    return {json: JSON.stringify(SceneStore.getScene(), null, '\t')};
}

var Player = React.createClass({
	
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

    render: function() {
        return (
            <div id="player">
                <pre>{this.state.json}</pre>
            </div>
        );
    }

});

module.exports = Player;