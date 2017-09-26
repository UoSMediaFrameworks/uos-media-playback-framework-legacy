var React = require('react');
var _ = require('lodash');
var SceneStore = require('../../stores/scene-store');
var GridStore = require("../../stores/grid-store");
var HubSendActions = require('../../actions/hub-send-actions');
var SceneActions = require('../../actions/scene-actions');
var Rnd = require('react-rnd');
var FontAwesome = require('react-fontawesome');
var Rectangle = require('react-rectangle');
var ImageLoader = require('react-imageloader');


var blankPlacement = {x: 0, y: 0, width: 100, height: 100}

var SceneEditorGUI = React.createClass({
    
    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null,
            scene: null,
            placement: blankPlacement,
            isRandom: true,
            IsAspectLocked: true,
            rotation: 0,
            height: 0,
            width: 0
        });
    },


    getStateFromStores: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
            uploading: false
        };
    },

    componentDidMount: function () {
        console.log("SceneEditorGUI: mounted")
        SceneStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange)

        this.setState({
            width: this.SceneLayoutArea.offsetWidth, 
            height: this.SceneLayoutArea.offsetHeight
        })
    
    },
    componentWillReceiveProps: function (nextProps) {},

    componentWillUnmount: function () {
        SceneStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange)
    },

    _onChange: function () {
        log("SceneEditorGUI: Scene change", this.getStateFromStores())
        this.setState(this.getStateFromStores());
    },

    _onFocusChange: function () {
        this.setState({
            focusedMediaObject: GridStore.getFocusedMediaObject(),
            placement: blankPlacement
        });
    },

    componentDidUpdate() {  
        //check for resize and update if size changed
        area = this.SceneLayoutArea;
        if (area.offsetHeight != this.state.height || area.offsetWidth != this.state.width ) {
            this.setState({width: area.offsetWidth, height: area.offsetHeight})
        }

    },

     //post render events:

    //object being dragged (don't save to many events generated)
    onSceneObjectResizing(e, direction, ref, delta, position) {
        var relativePlacement = blankPlacement
        relativePlacement.x = (position.x/this.SceneLayoutArea.offsetWidth)*100;
        relativePlacement.y = (position.y/this.SceneLayoutArea.offsetHeight)*100;
        relativePlacement.width = (refs.offsetWidth/this.SceneLayoutArea.offsetWidth)*100;
        relativePlacement.height = (ref.offsetHeight/this.SceneLayoutArea.offsetHeight)*100;
        this.setState({placement: placement, shouldSave: false});
    },

    //object dragging ended (now save once)
    onSceneObjectResizingEnded(e, direction, ref, delta, position) {
        //convert to relative units
        console.log("SceneEditorGUI: Ended")
        var relativePlacement = blankPlacement
        relativePlacement.x = (position.x/this.SceneLayoutArea.offsetWidth)*100;
        relativePlacement.y = (position.y/this.SceneLayoutArea.offsetHeight)*100;
        relativePlacement.width = (refs.offsetWidth/this.SceneLayoutArea.offsetWidth)*100;
        relativePlacement.height = (ref.offsetHeight/this.SceneLayoutArea.offsetHeight)*100;
        this.setState({placement: relativePlacement, shouldSave: true});
    },

    //object moving ended (should save)
    onSceneObjectMoved(e, d) {
        relativePlacement = this.state.placement; //needed for width/height
        relativePlacement.x = (d.x/this.SceneLayoutArea.offsetWidth)*100;
        relativePlacement.y = (d.y/this.SceneLayoutArea.offsetHeight)*100;
        this.setState({placement: relativePlacement, shouldSave: true})
    },

    render: function () {
        console.log("SceneEditorGUI: Rendering")
        console.log("SceneEditorGUI: Div size", this.SceneLayoutArea)
        var id = null;
        if (this.state.scene != null) {
            id = this.state.scene._id
        } else {
            id = "not selected"
        }

        return (
            <div className="mf-empty-grid-component">
                <Rectangle aspectRatio={[16, 9]}>
                    <div className="mf-scene-layout-area" ref={(c) => this.SceneLayoutArea = c}>
                        <Rnd
                            ref={(c) => this.SceneObject = c}
                            bounds='parent'
                            onDragStop={(e, d) => {
                                this.onSceneObjectMoved(e, d)
                            }}
                            onResize={(e, direction, ref, delta, position) => {
                                this.onSceneObjectResizing(e, direction, ref, delta, position)
                            }}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                this.onSceneObjectResizingEnded(e, direction, ref, delta, position)
                            }}
                            size={{
                                width: (this.state.placement.width/100)*this.state.width,
                                height: (this.state.placement.height/100)*this.state.height
                            }}
                            position={{
                                x: (this.state.placement.x/100)*this.state.width,
                                y: (this.state.placement.y/100)*this.state.height
                            }}
                            lockAspectRatio={this.state.placement.IsAspectLocked}>

                            <img draggable="false"
                                 className="mf-scene-layout-media-object"
                                 src = "images/video.png"
                            />

                        </Rnd>
                    </div>
                </Rectangle>
            </div>
        );
    },



});



module.exports = SceneEditorGUI;
