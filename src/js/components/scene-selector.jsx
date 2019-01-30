'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;

//stores
var SceneListStore = require('../stores/scene-list-store');
var HubSendActions = require('../actions/hub-send-actions');
var HubClient = require('../utils/HubClient');

//preview
var SelectPlus = require('react-select-plus').default;
var FontAwesome = require('react-fontawesome');
var ReactClipboard = require('react-copy-to-clipboard').CopyToClipboard;

//utils
var _ = require('lodash');

//constants
var LocalStorageKeys = require('../constants/local-storage-constants').LocalStorageKeys;

var SceneSelector = React.createClass({

  getInitialState: function () {
    var lastSelectedScene = JSON.parse(localStorage.getItem(LocalStorageKeys.SCENE_SELECTOR_FILTER));

    if (lastSelectedScene === null) {
      //no scene in local storage revert to default
      lastSelectedScene = {value: "none", label: "none"}
    }

    return _.extend(this._getState(), {
        sceneListFilter: {value: lastSelectedScene, label: lastSelectedScene.name},
        showModal: false,
        showDetailsModal: false
    });
  },

  _getState: function() {
      //add default blank option at top
      var sceneListItems = [{value: "none", label: "none"}]

      //get scene list and reformat for dropdown
      var scenes = SceneListStore.getAll()
      scenes.forEach(scene => {
        sceneListItems.push({label: scene.name, value: scene})
      });

      let state = {
          sceneListItems: sceneListItems,
      };

      //if a scene is already selected in the dropdown filter, update the values to match to store
      //match to store allows scene editor changes to a scenes name update the dropdown
      let existingFilterSelection = _.get(this, 'state.sceneListFilter.value._id');
      if (existingFilterSelection) {
          let selectedScene = _.find(sceneListItems, function(scene) { return scene.value._id === existingFilterSelection});
          if (selectedScene)
              state["sceneListFilter"] = selectedScene;
      }

      return state;
  },

  componentDidMount: function () {
      SceneListStore.addChangeListener(this._onSceneListChange);

      //focus last selected scene on refresh
      if (this.state.sceneListFilter.label != "none" && this.state.sceneListFilter != null) {
        this.props._sceneFocusHandler(this.state.sceneListFilter.value)
      }
  },

  componentWillUnmount: function () {
      SceneListStore.removeChangeListener(this._onSceneListChange);
  },

  _onSceneListChange: function () {
      this.setState(this._getState());
  },

//scene actions
  _createSceneHandler: function(sceneName) {
    var self = this;
    HubSendActions.tryCreateScene(sceneName, function(newScene) {
      self.setState({sceneListFilter: {value: newScene, label: newScene.name}})
    }) //dosn't check for duplicate names!
  },

  _deleteSceneHandler: function(event) {
    if (this.state.sceneListFilter != null  && this.state.sceneListFilter.value != "none") {
      if (confirm('Deleting a scene will remove all associated images and tags.\n\nAre you sure?')) {
        HubSendActions.deleteScene(this.state.sceneListFilter.value._id);
        this.setState({sceneListFilter: {value: "none", label: "none"}, showDetailsModal: false}) //clear selected scene
      }
    }
  },

  _onSceneSelect: function (e) {
    this.props._sceneFocusHandler(e.value) //propergate change up to grid store
    this.setState({sceneListFilter: {value:e.value, label: e.label}}) //update filter box and focused scene
  },

//modal events
  _showSceneModal: function() {
    this.setState({showModal: true})
  },

  _closeModal: function () {
    this.setState({showModal: false})
  },

  _completeModal: function() {
    //todo - prevent duplicate scene names? - not currently done because duplicates are valid provided there under different ID's.
    this._createSceneHandler(this.sceneNameInput.value)
    this.setState({showModal: false})
  },

  //details modal
  _showSceneDetailsModal: function() {
    if (this.state.sceneListFilter.value != "none") {
      this.setState({showDetailsModal: true})
    }
  },

  _closeDetailsModal: function () {
    this.setState({showDetailsModal: false})
  },

  _completeDetailsModal: function() {
    var newName = this.sceneNameEditInput.value;
    var self = this;

    //potentialy risky (saving over scene)
    HubClient.loadSceneWithCb(this.state.sceneListFilter.value._id, function(scene) {
      scene.name=newName;
      HubClient.save(scene);
      self.setState({showDetailsModal: false, sceneListFilter: {value: scene, label: scene.name}});
    });
  },

  componentDidUpdate: function() {
      //always save filter on change - save to local storage to maintain state on refresh
      //TODO need to consider what happens when a scene is renamed, this state.sceneListFilter may be out of date
      localStorage.setItem(LocalStorageKeys.SCENE_SELECTOR_FILTER, JSON.stringify(this.state.sceneListFilter.value));
  },

  render: function() {
    return (
      <div>
        <div className="SceneSelectorWrapper">
          <span className="inline-item navbar-text">Scene:</span>
            <SelectPlus className="inline-item sceneSelector-searchBox"
              style={{borderRadius: "0px"}}
              onCloseResetsInput ={false}
              onSelectResetsInput={false}
              clearable={false}
              value={this.state.sceneListFilter}
              options={this.state.sceneListItems}
              onChange={this._onSceneSelect}/>
            <button
              className="inline-item sceneSelector-button"
              onClick={this._showSceneDetailsModal}>
              <FontAwesome name='bars' size='2x'/>
            </button>
            <button
              className="inline-item sceneSelector-button"
              onClick={this._showSceneModal}>
              <FontAwesome name='plus-square-o' size='2x' style={{marginTop: "2px"}}/>
            </button>
        </div>

        <Modal show={this.state.showModal} onHide={this._closeModal}>
            <Modal.Header closeButton={true}>
              <span>Create New Scene</span>
            </Modal.Header>
            <Modal.Body>
              <div>
                <div className="inline-item">Scene Name:&nbsp;&nbsp;</div>
                <input
                  id="sceneNameInput"
                  className="inline-item"
                  ref={(input) => {this.sceneNameInput = input;}}/>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button onClick={this._closeModal}className="btn btn-danger">Cancel</button>
              <button onClick={this._completeModal} className="btn btn-success">Create</button>
            </Modal.Footer>
        </Modal>


        <Modal show={this.state.showDetailsModal} onHide={this._closeDetailsModal}>
            <Modal.Header closeButton={true}>
              <span>Scene Details</span>
            </Modal.Header>
            <Modal.Body>
            <div>
                <div className="inline-item" style={{marginBottom: "15px"}}>Scene ID:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                <input
                  id="sceneIDbox"
                  className="inline-item"
                  style={{width: "50%", backgroundColor: "#F5F5F5", borderWidth: "2px"}}
                  value={this.state.sceneListFilter.value._id}
                  readOnly="true"
                />
                <ReactClipboard text={this.state.sceneListFilter.value._id}>
                  <button style={{width: "10%"}}>Copy</button>
                </ReactClipboard>
              </div>
              <div>
                <div className="inline-item" style={{marginBottom: "15px"}}>Scene Name:&nbsp;&nbsp;</div>
                <input
                  id="sceneNameEditInput"
                  className="inline-item"
                  style={{width: "60%"}}
                  defaultValue={this.state.sceneListFilter.value.name}
                  ref={(input) => {this.sceneNameEditInput = input;}}
                  />
              </div>
              <div>
                <div className="inline-item">Scene Action:&nbsp;&nbsp;</div>
                <button onClick={this._deleteSceneHandler}className="btn btn-danger">Delete&nbsp;&nbsp;<FontAwesome name='trash-o' size='1x'/></button>
              </div>

            </Modal.Body>
            <Modal.Footer>
              <button onClick={this._completeDetailsModal} className="btn btn-success">Done</button>
            </Modal.Footer>
        </Modal>

      </div>
      )
  }

});

module.exports = SceneSelector;
