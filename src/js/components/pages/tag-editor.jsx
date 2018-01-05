var React = require('react');
var _ = require('lodash');

var SceneStore = require('../../stores/scene-store');
var GridStore = require("../../stores/grid-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var AssetActions = require('../../actions/asset-actions');

var FontAwesome = require('react-fontawesome');
var ReactTags = require('react-tag-input').WithContext;

//global save timeout
var saveTimeout = null;

//autosave timeout length - should be ~instant here to avoid missing tags
const saveTimeoutLength = 100;

var TagEditor = React.createClass({

//lifecycle

    getInitialState: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
            focusedMediaObject: null,
            shouldSave: false,
            tags: [],
            tags2: [],
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
        saveTimeout = setTimeout(this.saveToScene, saveTimeoutLength);
    },

    saveToScene() {

        var tags = [];

        if (this.state.tags.length > 0) {
            for (var i = 0; i < this.state.tags.length; i++) {
                tags.push(this.state.tags[i].text)
            }
        }

        var csv = tags.toString();
        //console.log(csv);

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
        var textOnlyTags =[];

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
                        textOnlyTags.push(mediaObjectTags[i].trim())
                    }

                }
            }

            //get any suggested ReactTags_blank
            var suggestedTags = [];
            var self = this;
            AssetActions.getSuggestedTags(mediaObject, function (remoteTags) {
              //check each suggested tag isn't already in the scene tags
              for (var i =0; i < remoteTags.length; i++) {
                if(textOnlyTags.indexOf(remoteTags[i]) === -1) {
                    suggestedTags.push({id: i, text: remoteTags[i]})
                }
              }
              self.setState({tags2: suggestedTags})
              self.forceUpdate() //don't know why but dosn't work without this.
            })

        }

        //update display - potentialy race condition but should always happen before remote responds
        this.setState({
            scene: scene,
            suggestions: this.getSceneTags(scene),
            focusedMediaObject: focusedMediaObject,
            tags: tags,
            tags2: []
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
                    if(tags.indexOf(newtag) === -1) {
                        tags.push(newtag);
                    }
                }
            }
            //console.log("Tags", tags);
            return tags;
        } else {
            return [];
        }
    },

//tag editor handlers

    handleDelete: function (i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags, shouldSave: true});
    },

    handleAddition: function (newTagText) {
        let tags = this.state.tags;

        for (var i = 0; i < tags.length; i++) {
          if (tags[i].text === newTagText) {
            return //exit function no point adding
          }
        }

        tags.push({
            id: tags.length + 1,
            text: newTagText
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

//suggested tag editor handlers

    handleDelete2: function(i) {
        let tags = this.state.tags2;
        this.handleAddition(tags[i].text) //add to scene tags
        tags.splice(i, 1);
        this.setState({tags2: tags});
    },

    handleAddition2: function(tag) {
        let tags = this.state.tags2;
        //only add new tags, no duplicates - should be none anyway
        if (tags.indexOf(tag) == -1) {
          //add the tag
          tags.push({
              id: tags.length + 1,
              text: tag
          });
          this.setState({tags2: tags}); //no need to save here
        }
    },

    handleDrag2: function(tag, currPos, newPos) {
        let tags = this.state.tags2;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({tags2: tags});
      },

//render functions

    render: function () {

      //other states
      if (this.state.scene == null) {
        return (
          <div>Please select a scene</div>
        )
      }

      if (this.state.focusedMediaObject == null) {
        return (
          <div>Please select a media object</div>
        )
      }

      var output = [];

      //show tags
      output.push(
        (<div>
          <p style={{paddingTop: '10px', paddingLeft: '5px', margin: '0px', paddingBottom: '2px'}}>Current Tags</p>
          <ReactTags
            tags={this.state.tags}
            suggestions={this.state.suggestions}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            handleDrag={this.handleDrag}
          />
        </div>)
      )

      //only show suggested tags when required
      if (this.state.tags2.length > 0) {
        output.push(
          (<div>
            <p style={{paddingTop: '10px', paddingLeft: '5px', margin: '0px', paddingBottom: '2px'}}>Suggested Tags (click <FontAwesome className='ReactTags_upArrow' name='arrow-up' size='1x'/> to add)</p>
            <ReactTags
              tags={this.state.tags2}
              suggestions={this.state.suggestions}
              handleDelete={this.handleDelete2}
              handleAddition={this.handleAddition2}
              handleDrag={this.handleDrag2}
              removeComponent={UseTagButton}
              classNames={{
                tagInput: 'ReactTags_blank',
                tagInputField: 'ReactTags_blank',
              }}
            />
          </div>)
        )
      }

      //normal state
      return (
        <div>
          {output}
        </div>
      )
    }

});

//used to replace the x on suggested tag editor with a upwards arrow button
class UseTagButton extends React.Component {
   render() {
      return (
        <button {...this.props} className="ReactTags_button">
          <FontAwesome className='ReactTags_upArrow' name='arrow-up' size='1x'/>
        </button>
      )
   }
}

module.exports = TagEditor;
