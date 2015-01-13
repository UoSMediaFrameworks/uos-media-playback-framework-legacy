'use strict';

var React = require('react');
var Router = require('react-router');
var SceneListStore = require('../stores/scene-list-store');
var Loader = require('./loader.jsx');
var Link = require('react-router').Link;

function _getState () {
    return {
        scenes: SceneListStore.getAll(),
        loading: SceneListStore.loadingScenes()
    };
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
            <Loader message='Retrieving Scene list...' loaded={! this.state.loading}>
                <ul>
                    {links}
                </ul>
            </Loader>
        );
    }

});

module.exports = SceneList;