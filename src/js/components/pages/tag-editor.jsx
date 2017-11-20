var React = require('react');
var _ = require('lodash');

var SceneStore = require('../../stores/scene-store');
var GridStore = require("../../stores/grid-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');

var ReactTags = require('react-tag-input').WithContext;

var saveTimeout = null;

//autosave timeout length
const saveTimeoutLength = 1000;

var TagEditor = React.createClass({

//lifecycle

    getInitialState: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
            focusedMediaObject: null,
            shouldSave: false,
            tags: [],
            suggestions: [],
            mediaObjectSelected: false
        };
    },

    componentDidMount: function () {
        //subscribe to changes
        SceneStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange)
    },

    componentWillUnmount: function () {
        if (saveTimeout) {
            //this.saveToScene()
            clearTimeout(saveTimeout);
        }
        SceneStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange)
    },

    componentDidUpdate: function () {
        //schedules a save in 1 second. Avoids to many saves
        if (this.state.shouldSave) {
            this.setState({shouldSave: false})
            this.setSave()
        }
    },

//autosave functions

    setSave() {
        console.log("TagEditor: Save Scheduled")
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(this.saveToScene, 3000);
    },

    saveToScene() {

        var tags = [];

        if (this.state.tags.length > 0) {
            for (var i = 0; i < this.state.tags.length; i++) {
                tags.push(this.state.tags[i].text)
            }
        }

        var csv = tags.toString();
        console.log(csv);

        try {
            var scene = this.state.scene
            scene.scene[this.state.focusedMediaObject].tags = csv;
            SceneActions.updateScene(scene)
            console.log("TagEditor: Changes saved");
        } catch (error) {
            console.log("TagEditor: Failed to save changes:", error)
        }

    },

//change handlers

    componentWillReceiveProps: function (nextProps) {
    },


    getNewState: function () {
        var scene = SceneStore.getScene(this.props._id)
        var focusedMediaObject = GridStore.getFocusedMediaObject();

        var mediaObject = null;
        var tags = [];

        if (focusedMediaObject != null) {

            //have to use try catch because focusedMediaObject can be out of bounds
            try {
                mediaObject = scene.scene[focusedMediaObject]
            } catch (error) {
                console.log("TagEditor: failed to read media object", error);
            }

        }

        if (mediaObject != null) {


            //get the tags from the scene object
            var mediaObjectTags = mediaObject.tags.split(",");

            //get rid of spaces and format for tag editor
            if (mediaObjectTags.length >= 1) {
                for (var i = 0; i < mediaObjectTags.length; i++) {
                    mediaObjectTags[i] = mediaObjectTags[i].trim();

                    //add tags as long as they are not empty
                    if (mediaObjectTags[i] != "") {
                        tags.push({id: i, text: mediaObjectTags[i].trim()})
                    }

                }
            }
        }
        //update display
        this.setState({
            scene: scene,
            suggestions: this.getSceneTags(scene),
            focusedMediaObject: focusedMediaObject,
            tags: tags
        });

    },


    _onChange: function () {
        this.getNewState();
    },

    _onFocusChange: function () {
        this.getNewState();
    },

    getSceneTags: function (scene) {
        if (scene != null) {
            var tags = []

            for (var i = 0; i < scene.scene.length; i++) {

                //pull tags from each media object and split down
                var newtags = scene.scene[i].tags.split(",");
                for (var j = 0; j < newtags.length; j++) {

                    //get rid of spaces
                    var newtag = newtags[j].trim()

                    //add tag only if it dosn't already exist
                    tags.indexOf(newtag) === -1 ? tags.push(newtag) : console.log("Tag Already Exists")
                }
            }
            console.log("Tags", tags);
            return tags;
        } else {
            return [];
        }
    },

//tag editor callbacks

    handleDelete: function (i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags, shouldSave: true});
    },

    handleAddition: function (tag) {
        let tags = this.state.tags;
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({tags: tags, shouldSave: true});
    },

    handleDrag: function (tag, currPos, newPos) {
        let tags = this.state.tags;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({tags: tags, shouldSave: true});
    },

    render: function () {

        if (this.state.focusedMediaObject == null) {
            return (
                <div>Please select a media object</div>
            )
        }

        return (
            <div>

                <ReactTags
                    tags={this.state.tags}
                    suggestions={this.state.suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag}
                />
            </div>

        )
    }

});

module.exports = TagEditor;
