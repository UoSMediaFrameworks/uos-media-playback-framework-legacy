'use strict';
/* jshint browser: true */
/* global confirm: false */

var React = require('react');

var ScenePlayer = require('../scene-player.jsx');
var SceneJsonEditor = require('../scene-json-editor.jsx');
var SceneTextEditor = require('../scene-text-editor.jsx');
var SceneStore = require('../../stores/scene-store');
var FileUploadStore = require('../../stores/file-upload-store');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var Router = require('react-router');
var DropZone = require('../drop-zone.jsx');
var FileUploadAlert = require('../file-upload-alert.jsx');
var Router = require('react-router'),
    Link = Router.Link;



var Scene = React.createClass({

    mixins: [Router.State, Authentication],

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.getParams().id),
            uploads: FileUploadStore.getStates(),
            focusedMediaObject: null
        }; 
    },

    componentDidMount:function(){
        SceneStore.addChangeListener(this._onChange);
        FileUploadStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SceneStore.removeChangeListener(this._onChange);
        FileUploadStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(this.getStateFromStores());
    },

    getInitialState: function() {
        return this.getStateFromStores();
    },

    fileHandler: function(fileList) {
        for (var i = 0; i < fileList.length; i++) {
            SceneActions.uploadAsset(this.state.scene, fileList[i]);
        }
    },

    deleteSceneHandler: function(event) {
        if (confirm('Deleting a scene will remove all associated images and tags.\n\nAre you sure?')) {
            console.log('deleting');
            HubSendActions.deleteScene(this.state.scene._id);
        }
    },

    thumbClickHandler: function(index) {
        this.setState({focusedMediaObject: index});
    },

    render: function() {
        var uploads = this.state.uploads;

        var fileUploads = Object.keys(uploads).map(function(name) {
            return <FileUploadAlert key={name} name={name} state={uploads[name]} />;
        });        

        return (
            <DropZone className='flex-container' handler={this.fileHandler}>
                <div className='top-bar'>
                    <div className='page-nav'>
                        <Link className='btn' to='scenes'>&lt; Back to Scene List</Link>
                    </div>

                    <div className='scene-controls'>
                        <a className='btn' onClick={this.deleteSceneHandler}>Delete Scene</a>
                    </div>

                    <h4 className='scene-name'>{this.state.scene.name}</h4>
                </div>
                
                <div className="file-upload-status">
                    {fileUploads}
                </div>
                <div className="thumbs-and-json">
                    <MediaObjectList focusHandler={this.thumbClickHandler} 
                     scene={this.state.scene} />
                    <SceneTextEditor focusedMediaObject={this.state.focusedMediaObject} 
                     scene={this.state.scene} />
                </div>
                <div className='tagList'>
                    <p>Tags: </p>
                </div>
            </DropZone>
        );
    }

});

module.exports = Scene;