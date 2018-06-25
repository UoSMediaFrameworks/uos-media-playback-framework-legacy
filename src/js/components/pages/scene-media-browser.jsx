var React = require('react');
var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');
var SceneSavedStore = require('../../stores/scene-saving-store');
var GridStore = require("../../stores/grid-store");
var AddMediaObjectStore = require("../../stores/add-media-object-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectList = require('../scene-editor/media-object-list.jsx');
var Loader = require('../loader.jsx');
var MediaPreviewComponent =  require('../scene-editor/media-preview-player.jsx');
var SplitPane = require('react-split-pane');
var Measure = require('react-measure');

var DEFAULT_SPLIT_PANE_POS = 150;

var SceneMediaBrowser = React.createClass({

    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null,
            dimensions: {
                width: -1,
                height: -1
              },
            lowerPaneHeight: 0
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
            uploading: AddMediaObjectStore.mediaUploading(),
            savedStatus: SceneSavedStore.getSceneSaved()
        };
    },

    componentDidMount: function () {
        SceneStore.addChangeListener(this._onChange);
        SceneSavedStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange);
        AddMediaObjectStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        SceneSavedStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange);
        AddMediaObjectStore.removeChangeListener(this._onChange);
    },

    render: function () {
        var showOverlay = this.state.uploading ? "show-overlay-when-uploading" : "hide-overlay-when-uploading";

        if (this.props._id == null || this.state.scene==null) {
            return (
                <div className="mf-empty-grid-component">
                    Scene has not been selected
                </div>
            );
        }

        return (
            <div className='RemoveWidgetPadding'>
                <div className={showOverlay}></div>
                <Measure onMeasure={this.onMeasure}>
                    <SplitPane id="splitPane" split="horizontal" minSize={0} maxSize={-15} defaultSize={this.getLastSplit()} onChange={size => this.splitChanged(size)}>
                        <div style={{width: "100%"}}>
                            <MediaPreviewComponent
                                style={{height: "100%", width: "100%"}}
                                focusedMediaObject={this.props.focusedMediaObject}
                                scene={this.state.scene}
                            />
                        </div>
                        <div style={{height: (""+this.state.lowerPaneHeight+"px"), width: "100%"}}>
                            <MediaObjectList
                                focusedMediaObject={this.props.focusedMediaObject}
                                focusHandler={SceneActions.changeMediaObjectFocus}
                                scene={this.state.scene}
                            />
                        </div>
                    </SplitPane>
                </Measure>
            </div>
        )
    },

    _normaliseSplitPos: function(newSplitPos) {
        return newSplitPos > this.state.dimensions.height ? DEFAULT_SPLIT_PANE_POS : newSplitPos;
    },

    splitChanged: function(size) {
        //store size in local store
        localStorage.setItem('splitPos', size)
        var lowerPaneHeight = this.state.dimensions.height-size-15
        this.setState({lowerPaneHeight: lowerPaneHeight})
    },

    getLastSplit: function() {
        if (localStorage.getItem("splitPos") === null) {
            //default split
            return DEFAULT_SPLIT_PANE_POS;
        } else {
            // APEP if we've cached a value larger than the dimensions of the component, lets fallback to default
            var cachedSplitPos = parseInt(localStorage.getItem('splitPos'), 10);
            return this._normaliseSplitPos(cachedSplitPos);
        }
    },

    onMeasure: function(dimensions) {
        var topPaneHeight=this.getLastSplit();
        var totalHeight = dimensions.height;
        var lowerPaneHeight=totalHeight-topPaneHeight-15;
        this.setState({dimensions: dimensions, lowerPaneHeight: lowerPaneHeight})
    },

});

module.exports = SceneMediaBrowser;
