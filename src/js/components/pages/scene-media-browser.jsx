var React = require('react');
var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');
var SceneSavedStore = require('../../stores/scene-saving-store');
var GridStore = require("../../stores/grid-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var TagUnion = require('../tag-union.jsx');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var AddMediaObject = require('../scene-editor/add-media-object.jsx');
var Loader = require('../loader.jsx');
var MediaPreviewComponent =  require('../scene-editor/media-preview-player.jsx');

var SceneMediaBrowser = React.createClass({

    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null
        });
    },

    _onChange: function () {
        this.setState(this.getStateFromStores());
    },
    _onFocusChange:function(){
        this.setState({focusedMediaObject:GridStore.getFocusedMediaObject()});
    },

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props._id),
            uploading: false,
            savedStatus: SceneSavedStore.getSceneSaved()
        };
    },
    componentDidMount: function () {
        SceneStore.addChangeListener(this._onChange);
        SceneSavedStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange);
    },
    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        SceneSavedStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange)
    },
    uploadStarted: function() {
        this.setState({uploading: true});
    },
    uploadEnded: function() {
        this.setState({uploading: false});
    },
    deleteSceneHandler: function(event) {
        if (confirm('Deleting a scene will remove all associated images and tags.\n\nAre you sure?')) {
            HubSendActions.deleteScene(this.state.scene._id);
        }
    },

    render: function () {

        var saveFlagKlass = this.state.savedStatus ? "green-save-flag" : "red-save-flag";

        var showOverlay = this.state.uploading ? "show-overlay-when-uploading" : "hide-overlay-when-uploading";
        if (this.props._id == null || this.state.scene==null) {
            return (
                <div className="mf-empty-grid-component">
                    Scene has not been selected
                </div>
            );
        }
        return (
            <div className='flex-container monaco-editor vs-dark'>
                <div className={showOverlay}></div>
                <div className='top-bar'>
                    <div className='scene-controls'>
                        <a className='btn btn-danger' onClick={this.deleteSceneHandler}>Delete Scene</a>
                    </div>
                    <Loader loaded={this.state.scene ? true : false} message='Loading Scene...'>
                        <h4 className='scene-name'>{this.state.scene ? this.state.scene.name : ''}</h4>
                    </Loader>
                </div>

                <AddMediaObject scene={this.state.scene} uploadStarted={this.uploadStarted}
                                uploadEnded={this.uploadEnded}/>

                <div className="thumbs-and-json">
                    <div className="flex-container">
                        <MediaObjectList focusedMediaObject={this.props.focusedMediaObject}
                                         focusHandler={SceneActions.changeMediaObjectFocus}
                                         scene={this.state.scene} saveFlagKlass={saveFlagKlass}/>

                        <MediaPreviewComponent focusedMediaObject={this.props.focusedMediaObject}
                                               scene={this.state.scene}/>

                    </div>

                </div>
                <TagUnion scene={this.state.scene} focusedMediaObject={this.state.focusedMediaObject}/>
            </div>
        )
    }


});

module.exports = SceneMediaBrowser;
