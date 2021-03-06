let React = require('react');
let _ = require('lodash');
let SceneStore = require('../stores/scene-store');
let GridStore = require("../stores/grid-store");
let HubSendActions = require('../actions/hub-send-actions');
let SceneActions = require('../actions/scene-actions');
let Rnd = require('react-rnd');
let FontAwesome = require('react-fontawesome');
let Rectangle = require('react-rectangle');
let ImageLoader = require('react-imageloader');
let MediaObjectPreview = require('./scene-editor/preview/media-object-preview.jsx');
let Glyphicon = require('./glyphicon.jsx');
let Hat = require('hat');
let NumericInput = require('react-numeric-input');
let AspectRatio = require('../utils/aspect-ratio.jsx');
let SceneEditorGUI = React.createClass({

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
        let selectedMediaObject = GridStore.getFocusedMediaObject()
        let scene = this.state.scene
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
        let scene = this.state.scene
        let currentTargets = scene.targets;

        let newTarget = {
            "ID": Hat(), //assign UID - not currently used but futureproofing JSON
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
        let scene = this.state.scene;
        let mediaObjectIndex = scene.targets[targetIndex].mediaObjects.indexOf(mediaObjectID);
        scene.targets[targetIndex].mediaObjects.splice(mediaObjectIndex, 1);
        this.setState({scene: scene});
        this.setSave();
    },

    getTargetMediaObjectsAsListItems: function(targetIndex) {
        let target = this.state.scene.targets[targetIndex];
        let mediaPreviewListItems = [];
        target.mediaObjects.forEach((mediaObjectID, index) => {
            let fullMediaObject = this.state.scene.scene.find(m => m._id === mediaObjectID) //find media object
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
        let scene = this.state.scene
        let selectedMediaObject = scene.scene[GridStore.getFocusedMediaObject()]._id;
        let targets = scene.targets;

        //remove any exisitng refrences to the media object (only one ref per layout)
        targets.forEach((target, index) => {
            let indexof = target.mediaObjects.indexOf(selectedMediaObject)
            if (indexof != -1) {
                targets[index].mediaObjects.splice(indexof, 1)
            }
        });

        scene.targets[targetIndex].mediaObjects.push(selectedMediaObject);
        this.setState({scene: scene})
        this.setSave();
    },

    SetTargetStyle: function(targetIndex, style) {
        let scene = this.state.scene;
        let target = scene.targets[targetIndex];


        switch (style) {
            case "grid":
                if (target.style === "grid") {
                    target.style = "";
                } else {
                    target.style = "grid";
                }
                break;
            default:
                taget.style = "";
        }

        scene.targets[targetIndex] = target;
        this.setState({scene: scene});
        this.setSave();
    },

    OnTargetDrag: function(targetIndex, newLocation) {
        let scene = this.state.scene
        scene.targets[targetIndex].Placement.x = (newLocation.x/this.state.width)*100;
        scene.targets[targetIndex].Placement.y = (newLocation.y/this.state.height)*100;
        this.setState({scene: scene})
        this.setSave();
    },

    OnTargetResize: function(targetIndex, newSize, placement) {
        let scene = this.state.scene
        scene.targets[targetIndex].Placement.width = (newSize.offsetWidth/this.state.width)*100;
        scene.targets[targetIndex].Placement.height = (newSize.offsetHeight/this.state.height)*100;
        scene.targets[targetIndex].Placement.x = (placement.x/this.state.width)*100;
        scene.targets[targetIndex].Placement.y = (placement.y/this.state.height)*100;
        this.setState({
            scene: scene
        });
        this.setSave();
    },

    RemoveTarget: function(targetIndex) {
        if (confirm('Remove target - all media in target will return to random placement?')) {
            let scene = this.state.scene;
            scene.targets.splice(targetIndex, 1);
            this.setState({scene: scene});
            this.setSave();
        }
    },

    toolbarButtonClick(e) {

        //choose action based on button ID
        let toolbarAction = e.target.id;

        //Current state - is updated into next state
        let placement = this.state.scene.targets[this.state.selectedIndex].Placement

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
        let selectedTemplate = e.target.id;
        let scene = this.state.scene;
        let placement = scene.targets[this.state.selectedIndex].Placement;

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

    setTargetGridRows(targetIndex, rows) {
        let scene = this.state.scene;
        scene.targets[targetIndex].rows = rows;
        this.setState({scene: scene});
        this.setSave();
    },

    setTargetGridCols(targetIndex, cols) {
        let scene = this.state.scene;
        scene.targets[targetIndex].cols = cols;
        this.setState({scene: scene});
        this.setSave();
    },


    zoom(direction, placement) {

        //Temp lets
        let oldWidth = placement.width;
        let oldHeight = placement.height

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

        let scene;

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

        let targets = this.state.scene.targets

        let renderTargets = []


        targets.forEach((target, index) => {
            let klass = "mf-placeable";

            let tempZIndex = 0;

            if (this.state.selectedIndex == index) {
                klass += "-selected";
                tempZIndex += 100; // temp bring to front when selected
            }

            let gridJSX = <div></div>;
            //required to avoid blowing up on targets that don't have style.
            if (!target.hasOwnProperty("style")) {
                target.style = "";
            } else {
                if (target.style === "grid") {
                    target.Placement.rotate = 0; //can't yet rotate a grid!
                    if (!target.hasOwnProperty("rows") || !target.hasOwnProperty("cols")) {
                        scene = this.state.scene;
                        scene.targets[index].rows = 2;
                        scene.targets[index].cols = 2;
                        this.setState({scene: scene});
                        this.setSave();
                    } else {
                        gridJSX = (
                            <div>
                                <span>
                                    <p className="mf-inlineBlock" style={{width: "50px"}}>Rows</p>
                                    <NumericInput min={1}
                                                  value={target.rows}
                                                  step={1}
                                                  precision={0}
                                                  snap
                                                  style={{
                                                    input: {
                                                        width: "100px",
                                                        color: 'black'
                                                    }
                                                  }}
                                                  onChange={(valueAsNumber) => this.setTargetGridRows(index, valueAsNumber)}
                                                  />
                                </span>
                                <br/>
                                <span>
                                    <p className="mf-inlineBlock" style={{width: "50px"}}>Cols</p>
                                    <NumericInput min={1}
                                                  value={target.cols}
                                                  step={1}
                                                  precision={0}
                                                  snap
                                                  style={{
                                                    input: {
                                                        width: "100px",
                                                        color: 'black'
                                                    }
                                                  }}
                                                  onChange={(valueAsNumber) => this.setTargetGridCols(index, valueAsNumber)}
                                                  />
                                </span>
                            </div>
                        )

                    }
                }
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
                    onResize={(e, direction, refToElement, delta, position) => this.OnTargetResize(index, refToElement, position)}
                >
                    <div className={klass}
                         onClick={() => {this.setState({selectedIndex: index})}}
                         style = {{transform: 'rotate(' + target.Placement.rotate + 'deg)', zIndex: target.Placement.z + tempZIndex, backgroundColor: "hsl(0, 0%, 20%)", overflowY: "hidden"}}
                         >
                        <span>
                            <div>{index + " - Layer: " + target.Placement.z + " style: " + target.style}</div>

                            {gridJSX}

                            <FontAwesome
                                id="addMediaToTarget"
                                className='mf-gui-toolbar-icon'
                                onClick={() => {this.AddSelectedMediaObjectToTarget(index)}}
                                name='plus-square'
                                size='2x'
                            />
                            <FontAwesome
                                id="addMediaToTarget"
                                className='mf-gui-toolbar-icon'
                                onClick={() => {this.SetTargetStyle(index, "grid")}}
                                name='th-large'
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
                                <ul className='' style={{overflowY: "scroll"}}>
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
                <AspectRatio ratio={this.state.scene.aspect || "16:9"} offset={80}>
                    <div className="mf-scene-layout-area" ref={(c) => this.SceneLayoutArea = c}>
                        {renderTargets}
                    </div>
                    <div className="mf-gui-toolbar">

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
                </AspectRatio>
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
        let mediaObjectPatch = [];

        this.state.scene.targets.forEach(target => {
            if (target.style === "grid") {
                let grid = this.getGridFromPlacement(target.Placement, target.rows , target.cols);
                target.mediaObjects.forEach((mediaObject, index) => {
                    let placement = _.cloneDeep(target.Placement);
                    let patchedPlacement = _.merge(placement, grid[index%grid.length])
                    let style = this.ConvertPlacmentToMfStyle(patchedPlacement);
                    style.padding = "5px"
                    mediaObjectPatch.push({id: mediaObject, style: style})
                });

            } else {
                let mfStyle = this.ConvertPlacmentToMfStyle(target.Placement)
                target.mediaObjects.forEach(mediaObject => {
                    mediaObjectPatch.push({id: mediaObject, style: mfStyle})
                });
            }
        });
        this.SaveToScene(mediaObjectPatch)
    },

    getGridFromPlacement(placement, rows, cols) {
        let cellWidth = placement.width/cols;
        let cellHeight = placement.height/rows;
        let cells = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                cells.push(
                    {
                        x: placement.x + col*cellWidth,
                        y: placement.y + row*cellHeight,
                        width: cellWidth,
                        height: cellHeight,
                    }
                )
            }
        }
        return cells;
    },

    SaveToScene: function(ChangedMediaObjects) {
        let scene = this.state.scene
        let mediaObjectList = scene.scene;

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
            let area = this.SceneLayoutArea;
            if (area.offsetHeight != this.state.height || area.offsetWidth != this.state.width) {
                this.setState({width: area.offsetWidth, height: area.offsetHeight})
            }
        }
    },

    ConvertPlacmentToMfStyle: function(placement) {
        let mfStyle = {};
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
