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
var MediaObjectPreview = require('../scene-editor/media-object-preview.jsx');
var Glyphicon = require('../glyphicon.jsx');

var SceneEditorGUI = React.createClass({ 
    
    saveTimeout: null,

    getInitialState: function() {
        return {
            selectedIndex: 0,
            scene: SceneStore.getScene(this.props._id)
        };
    },

    getStateFromStores: function() {
        return {
            scene: SceneStore.getScene(this.props._id)
        };
    },

    componentDidMount: function () {
        console.log("SceneEditorGUI: Mounted")
        //subscribe to changes
        SceneStore.addChangeListener(this._onChange);
        //GridStore.addChangeListener(this._onFocusChange)

        //this is the first point where rendered size of area can be captured
        if(this.SceneLayoutArea){
            this.setState({width: this.SceneLayoutArea.offsetWidth, height: this.SceneLayoutArea.offsetHeight})
        }
    },

    componentWillUnmount: function () {
        if (this.saveTimeout) {
            //this.saveToScene()
            clearTimeout(this.saveTimeout);
        }
        SceneStore.removeChangeListener(this._onChange);
        //GridStore.removeChangeListener(this._onFocusChange);
    },

    _onFocusChange() {
        var selectedMediaObject = GridStore.getFocusedMediaObject() 
        var scene = this.state.scene
        scene.targets[selectedIndex].mediaObjects.push(selectedMediaObject);
        this.setState({scene: scene});
        this.setSave();
    },

    _onChange: function () {
        //scene changed, clear all state
        clearTimeout(this.saveTimeout);
        
            console.log("SceneEditorGUI: Scene change", this.getStateFromStores())
            this.setState(this.getStateFromStores());
    },

    addTarget: function() {
        scene = this.state.scene
        currentTargets = scene.targets;
        
        var newTarget = {
            "ID": currentTargets.length, //next sequential ID (probably risky - UUID?)
            "Placement": {
                "x": 0,
                "y": 0,
                "z": 1,
                "width": 50,
                "height": 50,
                "rotate": 0,
                "isRandom": false,
            },
            "mediaObjects": []
        }
        currentTargets.push(
            newTarget
        )
        this.setState({
            scene: scene
        })
        this.setSave();
    },


    removeMediaObjectFromTarget: function(targetIndex, mediaObjectID) {
        var scene = this.state.scene;
        var mediaObjectIndex = scene.targets[targetIndex].mediaObjects.indexOf(mediaObjectID);
        scene.targets[targetIndex].mediaObjects.splice(mediaObjectIndex, 1);
        this.setState({scene: scene});
        this.setSave();
    },

    getTargetMediaObjectsAsListItems: function(targetIndex) {
        target = this.state.scene.targets[targetIndex];
        mediaPreviewListItems = [];
        target.mediaObjects.forEach((mediaObjectID, index) => {
            fullMediaObject = this.state.scene.scene.find(m => m._id == mediaObjectID) //find media object
            mediaPreviewListItems.push(
                <li className={"media-object-item"}
                key={index}
                onClick={() => {}}>
                <MediaObjectPreview mediaObject={fullMediaObject}>
                    <button className='btn' 
                            onClick={(mediaObject) => this.removeMediaObjectFromTarget(targetIndex, mediaObjectID)}>
                            <Glyphicon icon='remove-circle'/>
                    </button>
                </MediaObjectPreview>
                </li>
            )
        });
        return mediaPreviewListItems;
    },

    AddSelectedMediaObjectToTarget: function(targetIndex) {
        var scene = this.state.scene
        var selectedMediaObject = scene.scene[GridStore.getFocusedMediaObject()]._id;
        var targets = scene.targets;

        //remove any exisitng refrences to the media object (only one ref per layout)
        targets.forEach((target, index) => {
            var indexof = target.mediaObjects.indexOf(selectedMediaObject)
            if (indexof != -1) {
                targets[index].mediaObjects.splice(indexof, 1)
            }
        });

        scene.targets[targetIndex].mediaObjects.push(selectedMediaObject);
        this.setState({scene: scene})
        this.setSave();
    },
    
    OnTargetDrag: function(targetIndex, newLocation) {
        scene = this.state.scene
        scene.targets[targetIndex].Placement.x = (newLocation.x/this.state.width)*100;
        scene.targets[targetIndex].Placement.y = (newLocation.y/this.state.height)*100;
        this.setState({scene: scene})
        this.setSave();
    },

    OnTargetResize: function(targetIndex, newSize) {
        scene = this.state.scene
        scene.targets[targetIndex].Placement.width = (newSize.offsetWidth/this.state.width)*100;
        scene.targets[targetIndex].Placement.height = (newSize.offsetHeight/this.state.height)*100;
        this.setState({
            scene: scene
        });
        this.setSave();
    },

    RemoveTarget: function(targetIndex) {
        if (confirm('Remove target - all media in target will return to random placement?')) {
            scene = this.state.scene;
            scene.targets.splice(targetIndex, 1);
            this.setState({scene: scene});
            this.setSave();
        }
    },

    toolbarButtonClick(e) {

        //choose action based on button ID
        var toolbarAction = e.target.id;

        //Current state - is updated into next state
        var placement = this.state.scene.targets[this.state.selectedIndex].Placement

        switch (toolbarAction) {
            case "zoomIn":
                placement = this.zoom(1, placement);
                break;
            case "zoomOut":
                placement = this.zoom(0, placement);
                break;
            case "moveLeft":
                placement.x -= 1;
                break;
            case "moveRight":
                placement.x += 1;
                break;
            case "moveUp":
                placement.y -= 1;
                break;
            case "moveDown":
                placement.y += 1;
                break;
            case "rotate-left":
                placement.rotate = (placement.rotate - 45) % 360 //limit to 360 for user readability
                break;
            case "rotate-right":
                placement.rotate = (placement.rotate + 45) % 360 //limit to 360 for user readability
                break;
            case "zDown":
                placement.z -=1;
                break;
            case "zUp":
                placement.z +=1;
                break;
            default:
                console.log("SceneEditorGUI: Error toolbar action not registered");
                break;
        }
        this.state.scene.targets[this.state.selectedIndex].Placement = placement;
        this.setState({placement: placement})
        this.setSave();
    },

    //Appy template based on ID of clicked button
    templateButtonClick(e) {
        var selectedTemplate = e.target.id;
        scene = this.state.scene;
        var placement = scene.targets[this.state.selectedIndex].Placement;

        //Templates
        switch (selectedTemplate) {
            case "QuadUL":
                placement.x = 0;
                placement.y = 0;
                placement.width = 50;
                placement.height = 50;
                placement.rotate = 0;
                placement.IsAspectLocked = false;
                break;
            case "QuadUR":
                placement.x = 50;
                placement.y = 0;
                placement.width = 50;
                placement.height = 50;
                placement.rotate = 0;
                placement.IsAspectLocked = false;
                break;
            case "QuadLL":
                placement.x = 0;
                placement.y = 50;
                placement.width = 50;
                placement.height = 50;
                placement.rotate = 0;
                placement.IsAspectLocked = false;
                break;
            case "QuadLR":
                placement.x = 50;
                placement.y = 50;
                placement.width = 50;
                placement.height = 50;
                placement.rotate = 0;
                placement.IsAspectLocked = false;
                break;
            case "Full":
                placement.x = 0;
                placement.y = 0;
                placement.width = 100;
                placement.height = 100;
                placement.rotate = 0;
                placement.IsAspectLocked = false;
                break;
            case "Center":
                placement.x = 50 - placement.width / 2;
                placement.y = 50 - placement.height / 2;
                break;
            default:
                //Unknown ID - do nothing
                break;
        }
        scene.targets[this.state.selectedIndex].Placement = placement;
        this.setState({scene: scene});
        this.setSave();
    },

    //ToDo: Re-Write as snap to grid (not for first version)
    /*checkColision: function(e,d) {
        console.log(this.refs.ref1)
        console.log(this.refs.ref2)
        A = {
            width: this.refs.ref1.resizable.state.width,
            height: this.refs.ref1.resizable.state.height,
            x: this.refs.ref1.draggable.state.x,
            y: this.refs.ref1.draggable.state.y
        } 
        B = {
            width: this.refs.ref2.resizable.state.width,
            height: this.refs.ref2.resizable.state.height,
            x: this.refs.ref2.draggable.state.x,
            y: this.refs.ref2.draggable.state.y
        } 
       
        w = 0.5 * (A.width + B.width);
        h = 0.5 * (A.height + B.height);
        dx = (A.x + A.width/2) - (B.x + B.width/2);
        dy = (A.y + A.height/2) - (B.y + B.height/2);

       if (Math.abs(dx) <= w && Math.abs(dy) <= h)
       {
           //collision!
           wy = w * dy;
           hx = h * dx;

           if (wy > hx) {
           if (wy > -hx) {
               console.log("col top")
               this.refs.ref2.draggable.state.y = A.y - B.height;
           } else {
                console.log("col left")
                this.refs.ref2.draggable.state.x = A.x + A.width;
           }
           } else {
               if (wy > -hx) {
                console.log("col right")
                this.refs.ref2.draggable.state.x = A.x - A.width;
               } else {
                console.log("col bottom")
                this.refs.ref2.draggable.state.y = A.y + A.height;
               }
           }
       }
    },*/

    zoom(direction, placement) {

        //Temp vars
        var oldWidth = placement.width;
        var oldHeight = placement.height

        //Zoom in
        if (direction == 1) {
            placement.width = placement.width * 1.1;
            placement.height = placement.height * 1.1;
            placement.x = placement.x - (placement.width - oldWidth) / 2;
            placement.y = placement.y - (placement.height - oldHeight) / 2;
        }

        //Zoom out
        if (direction == 0) {
            placement.width = placement.width * 0.9;
            placement.height = placement.height * 0.9;
            placement.x = placement.x + (oldWidth - placement.width) / 2;
            placement.y = placement.y + (oldHeight - placement.height) / 2;
        }

        return placement;
    },

    render: function() {

        if (this.state.scene == null) {
            return (
                <div>Please select a scene</div>
            ) 
        } 

        if (!this.state.scene.hasOwnProperty("targets")) {
            scene = this.state.scene;
            scene.targets = [];
            this.setState({scene: scene})
            this.setSave()
        }

        var targets = this.state.scene.targets

        var renderTargets = []


        targets.forEach((target, index) => {
            var klass = "mf-placeable";

            var tempZIndex = 0;

            if (this.state.selectedIndex == index) {
                klass += "-selected";
                tempZIndex += 100; // temp bring to front when selected
            }

            renderTargets.push(
                <Rnd
                    size={{
                        width: (target.Placement.width / 100) * this.state.width,
                        height: (target.Placement.height / 100) * this.state.height
                    }}
                    position={{ 
                        x: (target.Placement.x / 100) * this.state.width,
                        y: (target.Placement.y / 100) * this.state.height
                    }}
                    bounds = "parent"
                    style = {{zIndex: target.Placement.z + tempZIndex}}
                    onDrag={(e, d) => this.OnTargetDrag(index, d)}                   
                    onResize={(e, direction, refToElement, delta, position) => this.OnTargetResize(index, refToElement)}
                >                
                    <div className={klass} 
                         onClick={() => {this.setState({selectedIndex: index})}}
                         style = {{transform: 'rotate(' + target.Placement.rotate + 'deg)', zIndex: target.Placement.z + tempZIndex, backgroundColor: "#3D4E6B"}}
                         >
                        <span>
                            <div>{target.ID + " - Layer: " + target.Placement.z }</div>

                            <FontAwesome
                                id="addMediaToTarget"
                                className='mf-gui-toolbar-icon'
                                onClick={() => {this.AddSelectedMediaObjectToTarget(index)}}
                                name='plus-square'
                                size='2x'
                            />
                            
                            <FontAwesome
                                id="addTarget"
                                className='mf-gui-toolbar-icon'
                                name='times-circle'
                                onClick = {() => this.RemoveTarget(index)}
                                size='2x'
                            />

                            <div className={"media-object-list media-object-list-Grid"}>
                                <ul className=''>
                                    {this.getTargetMediaObjectsAsListItems(index)}
                                </ul>
                            </div>

                        </span>
                    </div>
                </Rnd>
            )
        });    

        return (
            <div className="mf-empty-grid-component">
                <Rectangle aspectRatio={[16, 9]}>
                    <div className="mf-scene-layout-area mf_fs_widget_padding_remove" ref={(c) => this.SceneLayoutArea = c}>
                        {renderTargets}
                    </div>
                </Rectangle>
                <div className="mf-gui-toolbar mf_fs_widget_padding_remove">

                    <span>
                        <FontAwesome
                            id="moveUp"
                            className='mf-gui-toolbar-icon'
                            name='arrow-up'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                        <FontAwesome
                            id="moveDown"
                            className='mf-gui-toolbar-icon'
                            name='arrow-down'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                        <FontAwesome
                            id="moveLeft"
                            className='mf-gui-toolbar-icon'
                            name='arrow-left'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                        <FontAwesome
                            id="moveRight"
                            className='mf-gui-toolbar-icon'
                            name='arrow-right'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                    </span>

                    <span>
                        <FontAwesome
                            id='rotate-left'
                            className='mf-gui-toolbar-icon'
                            name='rotate-left'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                        <FontAwesome
                            id='rotate-right'
                            className='mf-gui-toolbar-icon'
                            name='rotate-right'
                            onClick={this.toolbarButtonClick}
                            size='2x'/>
                    </span>

                    <span>
                        <FontAwesome
                            id="zoomIn"
                            className='mf-gui-toolbar-icon'
                            name='search-plus'
                            size='2x'
                            onClick={this.toolbarButtonClick}/>
                        <FontAwesome
                            id="zoomOut"
                            className='mf-gui-toolbar-icon'
                            name='search-minus'
                            size='2x'
                            onClick={this.toolbarButtonClick}/>
                    </span>


                    <span>
                        Z-index (layer)
                        <FontAwesome
                            id="zUp"
                            className='mf-gui-toolbar-icon'
                            name='arrow-circle-up'
                            size='2x'
                            onClick={this.toolbarButtonClick}/>
                        <FontAwesome
                            id="zDown"
                            className='mf-gui-toolbar-icon'
                            name='arrow-circle-down'
                            size='2x'
                            onClick={this.toolbarButtonClick}/>
                    </span>

                    <span>
                        <FontAwesome
                            id="addTarget"
                            className='mf-gui-toolbar-icon'
                            onClick={this.addTarget}
                            name='plus-square'
                            size='2x'/>
                    </span>

                    <span className="mf-gui-editor-templateBar">
                        <span className="mf-gui-toolbar-text">Templates</span>
                        <img id="QuadUL" onClick={this.templateButtonClick} src="images/QuadUL.png"/>
                        <img id="QuadUR" onClick={this.templateButtonClick} src="images/QuadUR.png"/>
                        <img id="QuadLL" onClick={this.templateButtonClick} src="images/QuadLL.png"/>
                        <img id="QuadLR" onClick={this.templateButtonClick} src="images/QuadLR.png"/>
                        <img id="Full" onClick={this.templateButtonClick} src="images/Full.png"/>
                        <img id="Center" onClick={this.templateButtonClick} src="images/Center.png"/>
                    </span>

                </div>
            </div>
        )
        
    },

    setSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(this.Save, 1000);
    },

    Save: function() {
        mediaObjectPatch = [];

        this.state.scene.targets.forEach(target => {
            var mfStyle = this.ConvertPlacmentToMfStyle(target.Placement)
            target.mediaObjects.forEach(mediaObject => {
                mediaObjectPatch.push({id: mediaObject, style: mfStyle})
            });
        });
        this.SaveToScene(mediaObjectPatch)
    },

    SaveToScene: function(ChangedMediaObjects) {
        var scene = this.state.scene
        var mediaObjectList = scene.scene; 

        //apply media object changes
        ChangedMediaObjects.forEach(ChangedMediaObject => {
            mediaObjectList.forEach((mediaObject, index) => {
                if (mediaObject._id === ChangedMediaObject.id) {
                    scene.scene[index].style = ChangedMediaObject.style
                }
            })
        })

        SceneActions.updateScene(scene)
    },

    componentDidUpdate() {
        //check for resize and update if size changed (for percentage units)
        if (this.SceneLayoutArea != null) {
            var area = this.SceneLayoutArea;
            if (area.offsetHeight != this.state.height || area.offsetWidth != this.state.width) {
                this.setState({width: area.offsetWidth, height: area.offsetHeight})
            }
        }
    },

    ConvertPlacmentToMfStyle: function(placement) {
        var mfStyle = {};
        if (placement.isRandom == true) {
            //Random placement, provide no style so MF player uses random positioning
            mfStyle["z-index"] = 1;
        } else {
            //Targeted placement, provide a full style 
            mfStyle["z-index"] = placement.z;
            mfStyle["position"] = "absolute";
            //x,y coordinates map to CSS "top" and "left" (in relative units)
            mfStyle["left"] = '' + placement.x + "%";
            mfStyle["top"] = '' + placement.y + "%";
            mfStyle["width"] = '' + placement.width + "%";
            mfStyle["height"] = '' + placement.height + "%";
            mfStyle["max-width"] = '' + placement.width + "%";
            mfStyle["max-height"] = '' + placement.height + "%";
            mfStyle["transform"] = 'rotate(' + placement.rotate + 'deg)';
        }
        return mfStyle;
    }
    
})

module.exports = SceneEditorGUI;
