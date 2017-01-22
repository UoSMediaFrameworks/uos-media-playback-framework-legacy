'use strict';
/* jshint browser: true */
/* global confirm: false */

var React = require('react');
var _ = require('lodash');
var SceneTextEditor = require('../scene-text-editor.jsx');
var SceneStore = require('../../stores/scene-store');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var Loader = require('../loader.jsx');
var TagUnion = require('../tag-union.jsx');
var Router = require('react-router');
var AddMediaObject = require('../scene-editor/add-media-object.jsx');
var Router = require('react-router'),
    Link = Router.Link;

var MediaPreviewComponent =  require('../scene-editor/media-preview-player.jsx');
var SceneMonacoTextEditor = require('../scene-monaco-text-editor.jsx');


var Scene = React.createClass({

    mixins: [Router.State],

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props.params.id),
            saveStatus: true
        };
    },

    componentDidMount:function(){
        HubSendActions.loadScene(this.props.params.id);
        SceneStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(this.getStateFromStores());
    },

    getInitialState: function() {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null
        });
    },

    fileHandler: function(fileList) {
        for (var i = 0; i < fileList.length; i++) {
            SceneActions.uploadAsset(this.state.scene._id, fileList[i]);
        }
    },

    deleteSceneHandler: function(event) {
        if (confirm('Deleting a scene will remove all associated images and tags.\n\nAre you sure?')) {
            HubSendActions.deleteScene(this.state.scene._id);
        }
    },

    thumbClickHandler: function(index) {
        this.setState({focusedMediaObject: index});
    },

    sceneSavingHandler: function(saveStatus) {
        this.setState({saveStatus: saveStatus});
    },

    render: function() {


        var viewerUrl = '/viewer.html#/scene/' + this.props.params.id;

        var saveFlagKlass = this.state.saveStatus ? "green-save-flag" : "red-save-flag";


        return (
            <div className='flex-container monaco-editor vs-dark'>
                <div className='top-bar'>
                    <div className='page-nav'>
                        <Link className='btn' to='scenes'>&lt; Back to Scene List</Link>
                        <a className='btn' href={viewerUrl}>Open in Scene Viewer</a>
                    </div>

                    <div className='scene-controls'>
                        <a className='btn' onClick={this.deleteSceneHandler}>Delete Scene</a>
                    </div>
                    <Loader loaded={this.state.scene ? true: false} message='Loading Scene...'>
                        <h4 className='scene-name'>{this.state.scene ? this.state.scene.name : ''}</h4>
                    </Loader>
                </div>

                <AddMediaObject scene={this.state.scene} />

                <div className="thumbs-and-json">
                    <div className="flex-container">
                        <MediaObjectList focusedMediaObject={this.state.focusedMediaObject} focusHandler={this.thumbClickHandler}
                                         scene={this.state.scene} saveFlagKlass={saveFlagKlass}/>

                        <MediaPreviewComponent  focusedMediaObject={this.state.focusedMediaObject} scene={this.state.scene}  />
                    </div>

                    <div className="flex-container">
                        <SceneMonacoTextEditor focusedMediaObject={this.state.focusedMediaObject} sceneSavingHandler={this.sceneSavingHandler}
                                               scene={this.state.scene || {} } focusHandler={this.thumbClickHandler}/>
                    </div>

                </div>
                <TagUnion scene={this.state.scene}  focusedMediaObject={this.state.focusedMediaObject}/>
            </div>
        );
    }

});

module.exports = Scene;
