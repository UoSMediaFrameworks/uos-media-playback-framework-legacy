'use strict';
var React = require('react');
var lodash = require('lodash');
var VideoMediaObject = require('../models/video-media-object.jsx');
var TextMediaObject = require('../models/text-media-object.jsx');
var ImageMediaObject = require('../models/images-media-object.jsx');

var MediaObject = React.createClass({
    getInitialState: function () {
        return {

        };
    },
    setupState: function () {
        this.setState(this.getInitialState());
    },
    componentWillMount: function () {
        this.setupState();
    },
    componentDidMount: function () {
        var element = this.refs.object.refs[this.props.data.mediaObject._obj._id];

        // APEP allow the visualiser to obtain a reference
        this.props.onRef(this);

        //APEP When mounting component, apply the declared style rules and position if not declared by media objects CSS

        this.addStyle(element,this.props.data.mediaObject.style);
        if(! this.doesStyleDeclareMediaObjectPosition(this.props.data.mediaObject.style)) {
            this.placeAtRandomPosition(element);
        }

    },
    componentWillUnmount: function() {
        try {
            //APEP ensure the reference is removed when removed from display
            this.props.onRef(null);
        } catch (e) {
            console.log("MediaObject - componentWillUnmount - e: ", e);
        }
    },

    getObject: function() {
        return this.refs.object;
    },

    doesStyleDeclareMediaObjectPosition: function(style) {

        //APEP Find if the style declares the media objects position to be defined by the style tags provided

        var positionStyleTag  = lodash.find(Object.keys(style), function(styleKey) {
            return styleKey === "position" && style[styleKey] === "absolute";
        });

        //APEP TODO we should probably enforce at least one of the position absolute values exist ( top, left, etc )

        return positionStyleTag !== undefined;
    },
    addStyle:function(element, style) {
        lodash.forEach(Object.keys(style), function(styleKey) {
            // APEP Only apply CSS rules that are not position absolute declaration, the media-object CSS class already implements this rule.  This is a hack for an ugly bug
            if(! (styleKey === "position" && style[styleKey] === "absolute"))
                element.style[styleKey] = style[styleKey];
        });
    },
    calcDimension: function (player, dim, element) {
        var elementDimensionSize = element[dim];
        var playerDimensionSize = player[dim];
        var min = 0;
        var max = playerDimensionSize - elementDimensionSize;
        var finalPosition = lodash.random(min,max);
        return Math.round(finalPosition) + 'px';
    },
    placeAtRandomPosition: function (element) {
        var player = this.props.data.player;
        if (!element.style) {
            element.style = {}
        }
        element.style.left = this.calcDimension(player, 'clientWidth', element);
        element.style.top = this.calcDimension(player, 'clientHeight', element);
    },
    render: function () {
        var components = {
            text: TextMediaObject,
            image: ImageMediaObject,
            video: VideoMediaObject
        };

        var Object = components[this.props.data.mediaObject._obj.type];

        return (
            <div className="mO">
                <Object ref="object" data={this.props.data}/>
            </div>
        );
    }
});
module.exports = MediaObject;
