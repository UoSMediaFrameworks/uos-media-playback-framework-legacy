'use strict';
/* jshint browser: true */
/* global confirm: false */

var React = require('react');
var _ = require('lodash');
var SceneTextEditor = require('../scene-text-editor.jsx');
var SceneStore = require('../../stores/scene-store');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var Loader = require('../loader.jsx');
var TagUnion = require('../tag-union.jsx');
var Router = require('react-router');
var DropZone = require('../drop-zone.jsx');
var AddMediaObject = require('../scene-editor/add-media-object.jsx');
var Router = require('react-router'),
    Link = Router.Link;

var MediaPreviewComponent =  require('../scene-editor/media-preview-player.jsx');
var SceneMonacoTextEditor = require('../scene-monaco-text-editor.jsx');


var Scene = React.createClass({

    mixins: [Router.State, Authentication],

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props.params.id),
        };
    },

    componentDidMount:function(){
        HubSendActions.loadScene(this.props.params.id);
        SceneStore.addChangeListener(this._onChange);
    },

    onWillUnmount: function() {
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

    render: function() {


        var viewerUrl = '/viewer.html#/scenes/' + this.props.params.id;

        return (
            <DropZone className='flex-container' handler={this.fileHandler}>
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
                        <MediaObjectList focusHandler={this.thumbClickHandler}
                                         scene={this.state.scene}/>

                        <MediaPreviewComponent  focusedMediaObject={this.state.focusedMediaObject} scene={this.state.scene}  />
                    </div>


                    <SceneMonacoTextEditor focusedMediaObject={this.state.focusedMediaObject}
                                           scene={this.state.scene || {} }/>


                </div>
                <TagUnion scene={this.state.scene}
                 focusedMediaObject={this.state.focusedMediaObject}/>
            </DropZone>
        );
    }

});

module.exports = Scene;
