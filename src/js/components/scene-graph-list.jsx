'use strict';

var React = require('react');
var Router = require('react-router');
var SceneGraphListStore = require('../stores/scene-graph-list-store.jsx');
var Loader = require('./loader.jsx');
var Link = require('react-router').Link;

function _getState () {
    return {
        sceneGraphs: SceneGraphListStore.getAll(),
        loading: SceneGraphListStore.loadingScenes()
    };
}

var SceneGraphList = React.createClass({

    getInitialState: function() {
        return _getState();
    },

    componentDidMount: function() {
        SceneGraphListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SceneGraphListStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(_getState());
    },

    render: function() {
        var links = this.state.sceneGraphs.map(function(sceneGraph) {
            return (
                <li key={sceneGraph._id}>
                    <Link to={'/scenegraph/' + sceneGraph._id}>{sceneGraph.name}</Link>
                </li>
            );
        });

        return (
            <Loader className='scene-graph-list-loader' message='Retrieving Scene Graph list...' loaded={! this.state.loading}>
                <ul>
                    {links}
                </ul>
            </Loader>
        );
    }

});

module.exports = SceneGraphList;
