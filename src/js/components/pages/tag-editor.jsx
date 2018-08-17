var React = require('react');

//Stores
var SceneStore = require('../../stores/scene-store');
var GridStore = require("../../stores/grid-store");
//Actions
var SceneActions = require('../../actions/scene-actions');
var AssetActions = require('../../actions/asset-actions');
//UI components
var FontAwesome = require('react-fontawesome');
var ReactTags = require('react-tag-input').WithContext;

//Autosave timeout length - should be ~instant here to avoid missing tags
const saveTimeoutLength = 100;

var TagEditor = React.createClass({

    // instance variables
    saveTimeout: null,

//lifecycle
    getInitialState: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
            focusedMediaObject: null,
            shouldSave: false,
            objectTags: [],
            visionTags: [],
            sceneTags: [],
            autoCompleteEntries: [],
        };
    },

    componentDidMount: function () {
        //subscribe to scene and focused object changes
        SceneStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onChange)
    },

    componentWillUnmount: function () {
        if (this.saveTimeout) {
            //this.saveToScene()
            clearTimeout(this.saveTimeout);
        }
        SceneStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onChange)
    },

    componentDidUpdate: function () {
        //schedules a save. Avoids to many saves
        if (this.state.shouldSave) {
            this.setState({shouldSave: false})
            this.setSave()
        }
    },

//autosave functions

    setSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(this.saveToScene, saveTimeoutLength);
    },

    saveToScene() {

        //pull out only tag text
        var tags = this.state.objectTags.map(tag => tag.text);

        //toString on array of strings produces CSV by default
        var csv = tags.toString();

        try {
            var scene = this.state.scene
            scene.objects[this.state.focusedMediaObject].tags = csv;
            SceneActions.updateScene(scene)
            console.log("TagEditor: Changes saved");
        } catch (error) {
            console.log("TagEditor: Failed to save changes:", error)
        }

    },

//change handlers

    getNewState: function () {
        var scene = SceneStore.getScene(this.props._id)
        var focusedMediaObject = GridStore.getFocusedMediaObject();
        var mediaObject;

        if (focusedMediaObject != null) {
            try {
                mediaObject = scene.objects[focusedMediaObject]
            } catch (err) {
                console.log("failed to load media object", err)
            }

            console.log("MO", mediaObject);
            //get the tags from the media object
            var textTags = this.getMediaObjectTags(mediaObject);

            console.log("tags", textTags)

            //build a tag editor version
            var editorTags = this.createTagEditorList(textTags)

            console.log("tags", editorTags)

            var suggestedTags = [];
            var self = this;

            AssetActions.getSuggestedTags(mediaObject, function (remoteTags) {
                //check each suggested tag isn't already in the scene tags
                for (var i =0; i < remoteTags.length; i++) {
                 if(textTags.indexOf(remoteTags[i]) === -1) {
                     suggestedTags.push({id: i, text: remoteTags[i]})
                  }
                }

                self.setState({visionTags: suggestedTags})
                self.forceUpdate() //don't know why but dosn't work without this.
              })
        }

        //update display - potentialy race condition but should always happen before remote responds
        this.setState({
            scene: scene,
            autoCompleteEntries: this.getSceneTags(scene),
            focusedMediaObject: focusedMediaObject,
            objectTags: editorTags,
            visionTags: [],
            sceneTags: this.createTagEditorList(this.getSceneTags(scene))
        });

    },

    createTagEditorList(tags) {
        var editorTags = [];
        var index = 0 ;
        tags.forEach(tag => {
            editorTags.push({id: index, text: tags[index]});
            index++;
        });
        console.log(editorTags)
        return editorTags;
    },

    //redirect all change events to state fetch function.
    _onChange: function () {
        this.getNewState();
    },

    getSceneTags: function (scene) {

        var sceneTags = [];

        if (scene != null) {

            //rename to avoid confusion
            var sceneMediaObjects = scene.objects;

            //iterate media objects
            sceneMediaObjects.forEach(mediaObject => {

                //split and itterate object tags
               var  objectTags = mediaObject.tags.split(",");
                objectTags.forEach(rawTag => {
                    var cleanTag = rawTag.trim() //remove spaces

                    //add to scene tags if not already added.
                    if (sceneTags.indexOf(cleanTag) === -1) {
                        if (cleanTag != "") {
                            sceneTags.push(cleanTag);
                        }
                    }
                })
            });
        }
        sceneTags.sort((a, b) => a.localeCompare(b)) //alphabetical order
        return sceneTags;
    },


    getMediaObjectTags: function(mediaObject) {
        var tags = [];
        if (mediaObject != null) {
            var objectTags = mediaObject.tags.split(",");
            objectTags.forEach(rawTag => {
                var cleanTag = rawTag.trim();
                if (cleanTag != "") {
                    tags.push(cleanTag);
                }
            });
        }
        return tags;
    },

//tag editor handlers

    handleDelete: function (i) {
        let tags = this.state.objectTags;
        tag = tags.splice(i, 1);
        this.setState({objectTags: tags, shouldSave: true});
    },

    handleAddition: function (newTagText) {
        let tags = this.state.objectTags;

        for (var i = 0; i < tags.length; i++) {
          if (tags[i].text === newTagText) {
            return //exit function no point adding
          }
        }

        tags.push({
            id: tags.length + 1,
            text: newTagText
        });
        this.setState({objectTags: tags, shouldSave: true});
    },

    handleDrag: function (tag, currPos, newPos) {
        let tags = this.state.objectTags;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({objectTags: tags, shouldSave: true});
    },

//suggested tag editor handlers

    visionTagClick: function(index) {
        var visionTags = this.state.visionTags
        var clickedTag = visionTags[index];
        this.handleAddition(clickedTag.text) //add to scene tags
        visionTags.splice(index, 1); //remove from this list
        this.setState({visionTags: tags}); //update state
    },

    sceneTagClicked: function(index) {
        if (this.state.focusedMediaObject != null) {
            var clickedTag = this.state.sceneTags[index]
            var objectTags = this.state.objectTags
            this.pushIfUnique(clickedTag, objectTags)
            this.setState({objectTags: objectTags, shouldSave: true})
        }
    },

    pushIfUnique: function(tag, list) {
        if (list.indexOf(tag) === -1) {
            list.push(tag)
        }
    },

//render functions

    render: function () {

      //other states
      if (this.state.scene == null) {
        return (
          <div>Please select a scene</div>
        )
      }

      //only show click to add when object selected
      var sceneTagText = "Scene Tags"
      if (this.state.focusedMediaObject != null) {
          sceneTagText += " (click to add to object)"
      }

    //used to build a stack of tag editors
    var output = [];

    //show object tags if object is selected
    if(this.state.focusedMediaObject != null) {
        output.push(
        (<div>
          <p style={{paddingTop: '3px', paddingLeft: '5px', margin: '0px', paddingBottom: '0px', fontSize: '12px'}}>Object Tags</p>
            <ReactTags
                tags={this.state.objectTags}
                suggestions={this.state.autoCompleteEntries}
                handleDelete={this.handleDelete}
                handleAddition={this.handleAddition}
                handleDrag={this.handleDrag}
            />
        </div>)
        )
    }

    //only show suggested tags when required
    if (this.state.visionTags.length > 0) {
        output.push(
          (<div  >
            <p style={{paddingTop: '3px', paddingLeft: '5px', margin: '0px', paddingBottom: '0px', fontSize: '12px'}}>Suggested Tags (click to add)</p>
            <ReactTags
              tags={this.state.visionTags}
              handleTagClick={this.visionTagClick}
              removeComponent={UseTagButton}
              classNames={{
                tagInput: 'ReactTags_blank',
                tagInputField: 'ReactTags_blank',
              }}
            />
          </div>)
        )
    }

    //show scene tags always
    output.push(
        (<div>
            <p style={{paddingTop: '5px', paddingLeft: '5px', margin: '0px', paddingBottom: '2px', fontSize: '12px'}}>{sceneTagText}</p>
            <ReactTags
                tags={this.state.sceneTags}
                suggestions={this.state.autoCompleteEntries}
                handleTagClick = {this.sceneTagClicked}
                removeComponent={UseTagButton}
                classNames={{
                    tagInput: 'ReactTags_blank',
                    tagInputField: 'ReactTags_blank',
                }}
            />
        </div>)
    )

    //normal state
    return (
        <div style={{height: "auto", overflowY: "auto", marginBottom: "10px"}}>
          {output}
        </div>
    )
    }

});

//used to replace the x on suggested tag editor with blank space.
class UseTagButton extends React.Component {
   render() {
      return (
        <div></div>
      )
   }
}

module.exports = TagEditor;
