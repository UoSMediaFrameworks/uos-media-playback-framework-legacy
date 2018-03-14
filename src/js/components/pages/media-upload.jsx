var React = require('react');

//Stores
var SceneStore = require('../../stores/scene-store');
var SceneSavedStore = require('../../stores/scene-saving-store');
var GridStore = require("../../stores/grid-store");
var AddMediaObjectStore = require("../../stores/add-media-object-store");

var AddMediaObject = require('../scene-editor/add-media-object.jsx');

//Autosave timeout length - should be ~instant here to avoid missing tags
const saveTimeoutLength = 100;

var MediaUpload = React.createClass({

    getInitialState: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
        };
    },

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props._id),
        };
    },

    _onChange: function () {
        this.setState(this.getStateFromStores());
    },

    componentDidMount: function () {
        SceneStore.addChangeListener(this._onChange);
        SceneSavedStore.addChangeListener(this._onChange);
        AddMediaObjectStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        SceneSavedStore.removeChangeListener(this._onChange);
        AddMediaObjectStore.removeChangeListener(this._onChange);
    },
    

    render() {
        console.log(this.state.scene);
        return (
            <div className="mf-empty-grid-component">
             <AddMediaObject scene={this.state.scene}></AddMediaObject>
            </div>
        )
    }
})

module.exports = MediaUpload;