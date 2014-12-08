'use strict';

var React = require('react');

var ScenePlayer = require('../scene-player.jsx');
var SceneJsonEditor = require('../scene-json-editor.jsx');
var SceneStore = require('../../stores/scene-store');
var Authentication = require('../../mixins/Authentication');
var AddMediaObject = require('../scene-editor/add-media-object.jsx');
var HubSendActions = require('../../actions/hub-send-actions');
var MediaObjectTable = require('../scene-editor/media-object-table.jsx');
var Router = require('react-router');


var Scene = React.createClass({

    mixins: [Router.State, Authentication],

    getStateFromStore: function() {
        return {
            scene: SceneStore.getScene(this.getParams().id)
        }; 
    },

    componentDidMount:function(){
        SceneStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(this.getStateFromStore());
        //HubSendActions.saveScene(this.state.scene);
    },

    getInitialState: function() {
        return this.getStateFromStore();
    },

    render: function() {
        return (
        	<div className="row">
                <div className="col-sm-12">
                    <AddMediaObject sceneId={this.state.scene._id} />
                </div>
                <div className="col-sm-12">
                    <MediaObjectTable scene={this.state.scene} />
                </div>
                <div className="col-sm-12">
                    <SceneJsonEditor scene={this.state.scene} />
                </div>
        	</div>
        );
    }

});

module.exports = Scene;