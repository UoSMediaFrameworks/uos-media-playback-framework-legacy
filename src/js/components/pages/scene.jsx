'use strict';

var React = require('react');

var ScenePlayer = require('../scene-player.jsx');
var SceneJsonEditor = require('../scene-json-editor.jsx');
var SceneStore = require('../../stores/scene-store');
var FileUploadStore = require('../../stores/file-upload-store');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectTable = require('../scene-editor/media-object-table.jsx');
var Router = require('react-router');
var DropZone = require('../drop-zone.jsx');
var FileUploadAlert = require('../file-upload-alert.jsx');


var Scene = React.createClass({

    mixins: [Router.State, Authentication],

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.getParams().id),
            uploads: FileUploadStore.getStates()
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

    render: function() {
        var uploads = this.state.uploads;

        var fileUploads = Object.keys(uploads).map(function(name) {
            return <FileUploadAlert key={name} name={name} state={uploads[name]} />;
        });        

        return (
            <DropZone handler={this.fileHandler}>
                <div className="file-upload-status">
                    {fileUploads}
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <MediaObjectTable scene={this.state.scene} />
                    </div>
                    <div className="col-sm-12">
                        <SceneJsonEditor scene={this.state.scene} />
                    </div>
                </div>
            </DropZone>
        );
    }

});

module.exports = Scene;