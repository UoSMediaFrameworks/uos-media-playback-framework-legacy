'use strict';
var React = require('react');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneListStore = require('../../stores/scene-list-store');
var Link = require('react-router').Link;

function _getState () {
    return {scenes: SceneListStore.getAll()};
}

var _blank = 'BLANK';

var SceneList = React.createClass({

    mixins: [Authentication],
    
    getInitialState: function() {
        return _getState();
    },
    
    componentDidMount: function() {
        SceneListStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
        SceneListStore.removeChangeListener(this._onChange);
    },
    
    _onChange: function() {
        this.setState(_getState());
    },
    
    render: function() {
        var links = this.state.scenes.map(function(scene) {
            return (
                <Link to='scene' params={{id: scene._id}}>{scene.name}</Link>
            );
        });

        return (
            <div>
                {links}
            </div>
            
        );
    }

});

module.exports = SceneList;