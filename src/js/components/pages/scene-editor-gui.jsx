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

var saveTimeout = null;

var SceneEditorGUI = React.createClass({

    getInitialState: function () {
        return _.extend(this.getStateFromStores(), {
            focusedMediaObject: null,
            scene: null,
            placement: null,
            mediaObject: null,
            mediaTypeSupported: null,
            shouldSave: false,
            height: 0,
            width: 0,
        });
    },

    getStateFromStores: function () {
        return {
            scene: SceneStore.getScene(this.props._id),
        };
    },

    componentDidMount: function () {
        console.log("SceneEditorGUI: Mounted")

        //subscribe to changes
        SceneStore.addChangeListener(this._onChange);
        GridStore.addChangeListener(this._onFocusChange)

        //this is the first point where rendered size of area can be captured
        this.setState({width: this.SceneLayoutArea.offsetWidth, height: this.SceneLayoutArea.offsetHeight})
    },

    componentWillReceiveProps: function (nextProps) {
        //same as focus change, same handling procedure, required because selected scene change dosn't appear to reliably fire change event?? 
        //this._onFocusChange();
    },

    componentWillUnmount: function () {
        if (saveTimeout) {
            //this.saveToScene()
            clearTimeout(saveTimeout);
        }    
        SceneStore.removeChangeListener(this._onChange);
        GridStore.removeChangeListener(this._onFocusChange)
    },

    _onChange: function () {
        //scene changed, clear all state
        log("SceneEditorGUI: Scene change", this.getStateFromStores())
        this.setState(this.getStateFromStores());
    },

    _onFocusChange: function () {

        focusedMediaObject = GridStore.getFocusedMediaObject();
        scene = SceneStore.getScene(this.props._id);

        var mediaObject = null;
        var placement = null;
        var mediaTypeSupported = null;

        //have to use try catch because focusedMediaObject can be out of bounds
        try {
            mediaObject = scene.scene[focusedMediaObject]
        } catch (error) {
            console.log("SceneEditorGUI: failed to read media object", error);
        }

        //handle different media types
        if (mediaObject != null) {
            switch (mediaObject.type) {
                case "image":
                    //load image using loader as may take some time.
                    mediaTypeSupported = true
                    placement = this.getPlacementFromMfJSON(mediaObject);
                    break;
                case "video":
                    mediaTypeSupported = true
                    placement = this.getPlacementFromMfJSON(mediaObject);
                    break;
                default:
                    //unsupported media type
                    mediaTypeSupported = false
                    mediaRepresentation = null
                    break;
            }
        }

        this.setState(_.extend(this.getStateFromStores(), {
            focusedMediaObject: focusedMediaObject,
            placement: placement,
            mediaObject: mediaObject,
            mediaTypeSupported: mediaTypeSupported,
            shouldSave: false,
            scene: scene
        }));

    },

    getPlacementFromMfJSON(mediaObject) {
        placement = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            isRandom: false,
            IsAspectLocked: true,
            valid: true
        };

        if (mediaObject.style.position === "absolute") {
            try {
                console.log("SceneEditorGUI: Loading Position");
                placement.x = parseFloat(mediaObject.style.left)
                placement.y = parseFloat(mediaObject.style.top)
                placement.width = parseFloat(mediaObject.style.width)
                placement.height = parseFloat(mediaObject.style.height)
                placement.isRandom = false


                //get rotation
                if(mediaObject.style.transform != null) {
                    var rotateString = mediaObject.style.transform.match(/\(([^)]+)deg\)/)[1] //regex to extract rotate transform only
                    placement.rotation=parseInt(rotateString);
                } else {
                    placement.rotation = 0;
                }

                //check to test old content that only has partial position.
                if (isNaN(placement.y) || isNaN(placement.x) || isNaN(placement.width) || isNaN(placement.height)) {
                    placement.valid = false; //partial postion can't be converted without loss of auther intent.
                } else {
                    placement.valid = true;
                }

            } catch (error) {
                console.log("SceneEditorGUI: Error Loading Position", error);
                placement.valid=false;
            }

        } else {
            console.log("SceneEditorGUI: Position is Random");
            placement.isRandom = true;
            placement.valid = true;
        }


        console.log("SceneEditorGUI: Placement Loaded", placement);
        return placement;
    },

    getImageSize(url, callback) {
        var img = new Image();
        img.src = url;
        img.onload = function () {
            callback(this.width, this.height);
        }
    },

    // post render events: 
    componentDidUpdate() {
        //check for resize and update if size changed

        if (this.SceneLayoutArea != null) {
            area = this.SceneLayoutArea;
            if (area.offsetHeight != this.state.height || area.offsetWidth != this.state.width) {
                this.setState({width: area.offsetWidth, height: area.offsetHeight})
            }
        }

        //check save flag and schedule save if required
        if (this.state.shouldSave) {
            this.setSave();
        }

    },

    //get the best placement of an image while preserving aspect ratio
    getDefaultPlacement() {
          console.log("SceneEditorGUI: Getting Default Placement")
          placement = this.state.placement;
          if (this.state.mediaObject.type === "image") {
            var self = this
            this.getImageSize(self.state.mediaObject.url, function(imgWidth, imgHeight) {
    
                scaleX = imgWidth/self.state.width;
                scaleY = imgHeight/self.state.height;
    
                scaleX = self.state.width/imgWidth
                scaleY = self.state.height/imgHeight;
                
                var newWidth, newHeight
                //choose the smallest scale to get best fit
                if (scaleX < scaleY) {
                    newWidth = scaleX*imgWidth;
                    newHeight = scaleX*imgHeight;
                } else {
                    newWidth = scaleY*imgWidth;
                    newHeight = scaleY*imgHeight;
                }
    
                //convert back to relative units
                placement.x = 0;
                placement.y = 0;
                placement.width =  (newWidth/self.state.width)*100;
                placement.height = (newHeight/self.state.height)*100;
    
                //center image
                placement.x = 50 - placement.width / 2;
                placement.y = 50 - placement.height / 2;
                
                //set flags
                placement.lockAspectRatio = true; //lock aspect ratio to try to preserve 
                placement.isRandom = false;
                console.log("SceneEditorGUI: Placing with optimum aspect")
                self.setState({placement: placement, shouldSave: true})
            })
        
        } else {
            //can't auto find aspect
            console.log("SceneEditorGUI: Can't find aspect ratio, defaulting to full screen")
            placement.x = 0;
            placement.y = 0;
            placement.width = 100;
            placement.height = 100;
            placement.isRandom = false;
            this.setState({placement: placement, shouldSave: true})
        }
 
    },

    //schedules a save in 1 second. Avoids to many saves
    setSave() {
        console.log("SceneEditorGUI: Save Scheduled")
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(this.saveToScene, 1000);
    },

    saveToScene() {
        
                //Capture current state
                placement = this.state.placement;
        
                //Used to build the new style
                var mfStyle = {}
        
                //Random placement, provide no style so MF player uses random positioning
                if (this.state.placement.isRandom == true) {
                    mfStyle["z-index"] = 1;
                }
        
                //Map placement to correct CSS style
                if (this.state.placement.isRandom == false) {
                    mfStyle["z-index"] = 1;
                    mfStyle["position"] = "absolute";
                    //x,y coordinates map to CSS "top" and "left" (in relative units)
                    mfStyle["left"] = '' + placement
                        .x
                        .toFixed(2) + '%';
                    mfStyle["top"] = '' + placement
                        .y
                        .toFixed(2) + '%'
                    //Width and height (in relative units)
                    mfStyle["width"] = '' + placement
                        .width
                        .toFixed(2) + '%';
                    mfStyle["height"] = '' + placement
                        .height
                        .toFixed(2) + '%';
        
                    mfStyle["max-width"] = '' + placement
                        .width
                        .toFixed(2) + '%';
                    mfStyle["max-height"] = '' + placement
                        .height
                        .toFixed(2) + '%';
                    //Rotation (degrees)
                    mfStyle["transform"] = 'rotate(' + placement.rotation + 'deg)';
                }
        
                //Attemp to save back to the scene store
                try {
                    scene = this.state.scene
                    scene.scene[this.state.focusedMediaObject].style = mfStyle
                    SceneActions.updateScene(scene)
                    console.log("SceneEditorGUI: Changes saved:", JSON.stringify(mfStyle))
                } catch (error) {
                    console.log("SceneEditorGUI: Failed to save changes:", error)
                }
        
            },

    
    //object being dragged (don't save to many events generated)
    onSceneObjectResizing(e, direction, ref, delta, position) {
        var relativePlacement = this.state.placement
        relativePlacement.x = (position.x / this.SceneLayoutArea.offsetWidth) * 100;
        relativePlacement.y = (position.y / this.SceneLayoutArea.offsetHeight) * 100;
        relativePlacement.width = (ref.offsetWidth / this.SceneLayoutArea.offsetWidth) * 100;
        relativePlacement.height = (ref.offsetHeight / this.SceneLayoutArea.offsetHeight) * 100;
        this.setState({placement: placement, shouldSave: false});
    },

    //object dragging ended (now save once)
    onSceneObjectResizingEnded(e, direction, ref, delta, position) {
        //convert to relative units
        console.log("SceneEditorGUI: Ended")
        var relativePlacement = this.state.placement
        relativePlacement.x = (position.x / this.SceneLayoutArea.offsetWidth) * 100;
        relativePlacement.y = (position.y / this.SceneLayoutArea.offsetHeight) * 100;
        relativePlacement.width = (ref.offsetWidth / this.SceneLayoutArea.offsetWidth) * 100;
        relativePlacement.height = (ref.offsetHeight / this.SceneLayoutArea.offsetHeight) * 100;
        this.setState({placement: relativePlacement, shouldSave: true});
    },

    //object moving ended (should save)
    onSceneObjectMoved(e, d) {
        relativePlacement = this.state.placement; //needed for width/height
        relativePlacement.x = (d.x / this.SceneLayoutArea.offsetWidth) * 100;
        relativePlacement.y = (d.y / this.SceneLayoutArea.offsetHeight) * 100;
        this.setState({placement: relativePlacement, shouldSave: true})
    },

    //Handles mouse over scroll to zoom
    mouseWheelZoom(e) {

        //Stops window scrolling
        e.preventDefault()

        placement = this.state.placement;

        //Zooming in - wheel towards
        if (e.deltaY > 0) {
            placement = this.zoom(1, placement);
        }

        //Zooming out - wheel away
        if (e.deltaY < 0) {
            placement = this.zoom(0, placement)
        }

        this.setState({placement: placement, shouldSave: true})
    },

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

    //handles toolbar actions
    toolbarButtonClick(e) {

        //choose action based on button ID
        var toolbarAction = e.target.id;

        //Current state - is updated into next state
        var placement = this.state.placement;

        switch (toolbarAction) {
            case "zoomIn":
                placement = this.zoom(1, placement);
                break;

            case "zoomOut":
                placement = this.zoom(0, placement);
                break;

            case "moveLeft":
                placement.x -= 5;
                break;

            case "moveRight":
                placement.x += 5;
                break;

            case "moveUp":
                placement.y -= 5;
                break;

            case "moveDown":
                placement.y += 10;
                break;

            case "aspectRatio":
                placement.IsAspectLocked = !placement.IsAspectLocked;
                break;

            case "rotate-left":
                placement.rotation = (placement.rotation - 45) % 360 //limit to 360 for user readability
                break;

            case "rotate-right":
                placement.rotation = (placement.rotation + 45) % 360 //limit to 360 for user readability
                break;
            default:
                console.log("SceneEditorGUI: Error toolbar action not registered");
                break;
        }

        this.setState({placement: placement, shouldSave: true})

    },

    toggleRandomPlacement() {
        console.log("SceneEditorGUI: Toggle Random Placement")
        placement = this.state.placement;
        if (placement.isRandom == true) {
            this.getDefaultPlacement();
        } else {
            placement.isRandom = true;
            this.setState({placement: placement, shouldSave: true})
        }
    },

    //Appy template based on ID of clicked button
    templateButtonClick(e) {

        var selectedTemplate = e.target.id;

        var placement = this.state.placement;

        //Templates
        switch (selectedTemplate) {
            case "QuadUL":
                placement.x = 0;
                placement.y = 0;
                placement.width = 50;
                placement.height = 50
                placement.IsAspectLocked = false;
                break;

            case "QuadUR":
                placement.x = 50;
                placement.y = 0;
                placement.width = 50;
                placement.height = 50;
                placement.IsAspectLocked = false;
                break;

            case "QuadLL":
                placement.x = 0;
                placement.y = 50;
                placement.width = 50;
                placement.height = 50;
                placement.IsAspectLocked = false;
                break;

            case "QuadLR":
                placement.x = 50;
                placement.y = 50;
                placement.width = 50;
                placement.height = 50;
                placement.IsAspectLocked = false;
                break;

            case "Full":
                placement.x = 0;
                placement.y = 0;
                placement.width = 100;
                placement.height = 100;
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
        this.setState({placement: placement, shouldSave: true});
    },

    //displayed while waiting for potentialy slow loading content to be delivered
    imagePreloader() {
        return (
            <div className='mf-media-loader-box'>
            <FontAwesome
                className="mf-media-loader-spinner"
                name='spinner'
                size='4x'
                spin
                style={{
                    textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'
                }}
            />
            </div>
        )
    },

    getMediaRepresentation(mediaObject) {
        switch (mediaObject.type) {
            
            case "image":
                return (
                    <ImageLoader
                        src={this.state.mediaObject.url}
                        imgProps={{
                            className: "mf-scene-layout-media-object",
                            draggable: false,
                            onWheel: this.mouseWheelZoom
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            transform: 'rotate(' + this.state.placement.rotation + 'deg)'
                        }}
                        wrapper={React.DOM.div}
                        preloader={this.imagePreloader}>
                        Error: Image load failed!
                    </ImageLoader>
                )
            break;
            
            case "video":
               return (
                    <img
                        src="images/video.png"
                        className="mf-scene-layout-media-object"
                        onWheel={this.mouseWheelZoom}
                        style={{
                            transform: 'rotate(' + this.state.placement.rotation + 'deg)'
                        }}
                        draggable={false}
                    />
                )
                placement = this.getPlacementFromMfJSON(mediaObject);
            break;
            
            default:
                //supported but not displayable
                return (
                <div className="mf-scene-layout-media-object">
                    This media can't be displayed but may still be placed
                </div>
                )
            break;
        }
    },


    render: function () {
        //for debug
        console.log("SceneEditorGUI: Rendering", this.state)

        if (this.state.scene == null) {
            return(<div className="mf-empty-grid-component">Please select a scene</div>)
        }

        if (this.state.focusedMediaObject == null) {
            return(<div className="mf-empty-grid-component">Please select a media object</div>)
        }


        if (this.state.mediaTypeSupported == false) {
            //unsupported type, no reason to load the editor
            return(
                <div className="mf-empty-grid-component">This media type can't be positioned</div>
            )
        } else {
            //supported type, load the editor
            if (this.state.placement != null) {


                if (this.state.placement.valid == false) {
                    return(<div className="mf-empty-grid-component">This objects placement is invalid, please check it's style is fully specifed with top, left, width and height in the JSON</div>)
                }
        

                if (placement.isRandom) {
                    //placement is random disable all controls and display message
                    return (
                        <div className="mf-no-scroll-grid-component">
                        <Rectangle aspectRatio={[16, 9]}>
                            <div className="mf-scene-layout-area" ref={(c) => this.SceneLayoutArea = c}>
                                By default content is placed randomly. Uncheck random placement to manualy
                                position media.
                            </div>
                        </Rectangle>

                        <div className="mf-gui-toolbar">
                            <span>
                                <span className="mf-gui-toolbar-text">Random Postion</span>
                                <FontAwesome
                                    id="randomPlacement"
                                    className='mf-gui-toolbar-icon'
                                    onClick={this.toggleRandomPlacement}
                                    name='check-square-o'
                                    size='2x'/>
                            </span>
                        </div>
                    </div>
                    )
                } else {
                    //placement is manual, load the full editor 
                    
                    //get the correct icon state
                    var aspectIcon;
                    if (this.state.placement.IsAspectLocked) {
                        aspectIcon = "lock";
                    } else {
                        aspectIcon = "unlock";
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
                                        width: (this.state.placement.width / 100) * this.state.width,
                                        height: (this.state.placement.height / 100) * this.state.height
                                    }}
                                        position={{
                                        x: (this.state.placement.x / 100) * this.state.width,
                                        y: (this.state.placement.y / 100) * this.state.height
                                    }}
                                        lockAspectRatio={this.state.placement.IsAspectLocked}>

                                        {this.getMediaRepresentation(this.state.mediaObject)}

                                    </Rnd>
                                </div>
                            </Rectangle>
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
                                    <span className="mf-gui-toolbar-text">Random Postion</span>
                                    <FontAwesome
                                        id="randomPlacement"
                                        className='mf-gui-toolbar-icon'
                                        onClick={this.toggleRandomPlacement}
                                        name='square-o'
                                        size='2x'/>
                                </span>

                                <span>
                                    <span className="mf-gui-toolbar-text">Aspect Ratio</span>
                                    <FontAwesome
                                        id="aspectRatio"
                                        className='mf-gui-toolbar-icon'
                                        onClick={this.toolbarButtonClick}
                                        name={aspectIcon}
                                        size='2x'/>
                                </span>

                                <span>
                                    <FontAwesome
                                        id="refresh"
                                        className='mf-gui-toolbar-icon'
                                        onClick={this.getDefaultPlacement}
                                        name='refresh'
                                        size='2x'/>
                                </span>

                                <span className="mf-gui-editor-templateBar">
                                    <span className="mf-gui-toolbar-text">Templates</span>
                                    <img
                                        id="QuadUL"
                                        width='32'
                                        height='32'
                                        onClick={this.templateButtonClick}
                                        src="images/QuadUL.png"/>
                                    <img id="QuadUR" onClick={this.templateButtonClick} src="images/QuadUR.png"/>
                                    <img id="QuadLL" onClick={this.templateButtonClick} src="images/QuadLL.png"/>
                                    <img id="QuadLR" onClick={this.templateButtonClick} src="images/QuadLR.png"/>
                                    <img id="Full" onClick={this.templateButtonClick} src="images/Full.png"/>
                                    <img id="Center" onClick={this.templateButtonClick} src="images/Center.png"/>
                                </span>

                            </div>
                        </div>
                    );
                }

                

            }
        }
        return (<div className="mf-empty-grid-component"> failed to render component</div>)
    }


});

module.exports = SceneEditorGUI;
