'use strict';

var React = require('react');
var Router = require('react-router');
var SceneGraphListStore = require('../stores/scene-graph-list-store.jsx');
var Loader = require('./loader.jsx');
var _ = require('lodash');
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
        var self = this;
        var filteredSceneGraph =  this.state.sceneGraphs;
        if (this.props.filterText) {
            filteredSceneGraph = _.filter(filteredSceneGraph, function (scene) {
                return scene.name.toLowerCase().indexOf(self.props.filterText.toLowerCase()) !== -1;
            });
        }
        if(this.props.sortBy){

            filteredSceneGraph.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );


        }
        if(this.props.sortBy == "desc"){
            filteredSceneGraph.reverse();
        }
        var links = filteredSceneGraph.map(function(sceneGraph) {
            return (
                <li key={sceneGraph._id} className="col-xs-12">
                    <div className="col-md-9">
                        <Link className="link" to={'/scenegraph/' + sceneGraph._id}>{sceneGraph.name}</Link>
                    </div>
                </li>
            );
        });

        return (
            <Loader className='scene-graph-list-loader' message='Retrieving Scene Graph list...' loaded={! this.state.loading}>
                <ul  className="nav nav-pills .nav-stacked col-xs-12">
                    {links}
                </ul>
            </Loader>
        );
    }

});

module.exports = SceneGraphList;
