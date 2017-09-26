var React = require('react');
var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');
var GridStore = require("../../stores/grid-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var TagUnion = require('../tag-union.jsx');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var AddMediaObject = require('../scene-editor/add-media-object.jsx');
var Loader = require('../loader.jsx');
var MediaPreviewComponent =  require('../scene-editor/media-preview-player.jsx');

var SceneEditorGUI = React.createClass({

    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null
        });
    },

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props._id),
            uploading: false
        };
    },

    componentDidMount: function () {

        SceneStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange)
    },
    componentWillReceiveProps: function (nextProps) {
    },

    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange)
    },

    render: function () {
        return (
                <div className="mf-empty-grid-component">
                    {this.props._id}
                    {this.props.focusedMediaObject}
                </div>
        );
    }


});

module.exports = SceneEditorGUI;
