'use strict';

var React = require('react');
var Router = require('react-router');
var SceneGraphListStore = require('../stores/scene-graph-list-store.jsx');
var Loader = require('./loader.jsx');
var _ = require('lodash');
var Link = require('react-router').Link;

function _getState() {
    return {
        sceneGraphs: SceneGraphListStore.getAll(),
        loading: SceneGraphListStore.loadingScenes()
    };
}

var SceneGraphList = React.createClass({

    getInitialState: function () {
        return _getState();
    },

    componentDidMount: function () {
        SceneGraphListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        SceneGraphListStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
        this.setState(_getState());
    },

    render: function () {
        var self = this;
        var filteredSceneGraph = this.state.sceneGraphs;
        if (this.props.filterText) {
            filteredSceneGraph = _.filter(filteredSceneGraph, function (scene) {
                return scene.name.toLowerCase().indexOf(self.props.filterText.toLowerCase()) !== -1;
            });
        }
        if (this.props.sortBy) {
            filteredSceneGraph.sort(function (a, b) {
                if(a.name.toLowerCase() < b.name.toLowerCase() ) return -1;
                if(a.name.toLowerCase()  > b.name.toLowerCase() ) return 1;
                return 0;
            });
        }
        if (this.props.sortBy == "desc") {
            filteredSceneGraph.reverse();
        }
        var links = filteredSceneGraph.map(function (sceneGraph) {
            return (
                <dd key={sceneGraph._id} className="col-xs-12 mf-link">
                    <div>
                        {/*
                        Change from a link to a label, since we are not switching url's
                        but passing data through handlers. This can be a conditional statement
                        for the component be it standalone or part of the layout.
                        */}
                        <label  onClick={self.props._sceneGraphFocusHandler.bind(self,sceneGraph)}
                                onTouchEndCapture={self.props._sceneGraphFocusHandler.bind(self,sceneGraph)}
                        >{ sceneGraph.name}</label>
                      {/*  <Link className="link" to={'/scenegraph/' + sceneGraph._id}>{sceneGraph.name}</Link>*/}
                    </div>
                </dd>
            );
        });

        return (
            <Loader className='scene-graph-list-loader' message='Retrieving Scene Graph list...'
                    loaded={!this.state.loading}>
                <dl className="nav nav-pills .nav-stacked col-xs-12">
                    {links}
                </dl>
            </Loader>
        );
    }

});

module.exports = SceneGraphList;
