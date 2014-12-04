'use strict';

var React = require('react');
var Router = require('react-router');
var SceneListStore = require('../stores/scene-list-store');
var Link = require('react-router').Link;

function _getState () {
    return {scenes: SceneListStore.getAll()};
}


var SceneList = React.createClass({

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
                <li key={scene._id}>
                    <Link to='scene' params={{id: scene._id}}>{scene.name}</Link>
                </li>
            );
        });

        return (
            <ul>
                {links}
            </ul>
        );
    }

});

module.exports = SceneList;