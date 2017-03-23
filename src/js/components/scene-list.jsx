'use strict';

var React = require('react');
var Router = require('react-router');
var SceneListStore = require('../stores/scene-list-store');
var Loader = require('./loader.jsx');
var Link = require('react-router').Link;
var _ = require('lodash');
var ConnectionCache = require('../utils/connection-cache.js');

function _getState() {
    return {
        scenes: SceneListStore.getAll(),
        loading: SceneListStore.loadingScenes()
    };
}


var SceneList = React.createClass({

    getInitialState: function () {
        return _getState();
    },

    componentDidMount: function () {
        SceneListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        SceneListStore.removeChangeListener(this._onChange);
    },

    _onChange: function () {
        this.setState(_getState());
    },

    render: function () {
        var self = this;
        var filteredScene = this.state.scenes;
        if(this.props.filterGroupId != null && this.props.filterGroupId !== "None"){
            filteredScene = _.filter(filteredScene,function(scene){
                return scene._groupID.toString() == self.props.filterGroupId
            })
        }
        if (this.props.filterText) {
            filteredScene = _.filter(filteredScene, function (scene) {
                return scene.name.toLowerCase().indexOf(self.props.filterText.toLowerCase()) !== -1;
            });
        }

        console.log(filteredScene);
        var links = filteredScene.map(function (scene) {
            var sceneLinkText = ConnectionCache.getShortGroupName(scene._groupID) + ' - ' + scene.name;
            return (
                <dd key={scene._id} className="col-xs-12">
                    <div className="col-md-9">
                        <Link to={'scene/' + scene._id}>{ sceneLinkText }</Link>
                    </div>

                </dd>
            );
        });

        return (
            <Loader className='scene-list-loader' message='Retrieving Scene list...' loaded={!this.state.loading}>
                <dl className="nav nav-pills .nav-stacked col-xs-12">
                    {links}
                </dl>
            </Loader>
        );
    }

});

module.exports = SceneList;
