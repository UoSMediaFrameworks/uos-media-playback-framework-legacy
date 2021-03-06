'use strict';
var React = require('react');
var _ = require('lodash');
var VideoMediaObject = require('../models/video-media-object.jsx');
var TextMediaObject = require('../models/text-media-object.jsx');
var ImageMediaObject = require('../models/images-media-object.jsx');
var AudioMediaObject = require('../models/audio-media-object.jsx');

var MediaObject = React.createClass({

    //ZINDEX counter to be used for continuous bring to front, allows the next z index to be used
    statics: {
        zIndexCounter: 10000
    },

    getInitialState: function () {
        return {};
    },
    setupState: function () {
        this.setState(this.getInitialState());
    },
    componentWillMount: function () {
        // console.log("Mo will mount",this.props);

        this.setupState();
    },
    componentDidMount: function () {
        var element = this.refs.object.refs[this.props.data.mediaObject._obj._id];

        //APEP When mounting component, apply the declared style rules and position if not declared by media objects CSS
        this.addStyle(element, this.props.data.mediaObject.style);

        this.positionElement();
    },

    getObject: function () {
        return this.refs.object;
    },

    doesStyleDeclareMediaObjectPosition: function (style) {

        //APEP Find if the style declares the media objects position to be defined by the style tags provided

        var positionStyleTag = _.find(Object.keys(style), function (styleKey) {
            return styleKey === "position" && style[styleKey] === "absolute";
        });

        //APEP TODO we should probably enforce at least one of the position absolute values exist ( top, left, etc )

        return positionStyleTag !== undefined;
    },

    canMediaObjectProvideDefaultSize: function(heightOrWidth) {

        var styleAsObject = this.props.data.mediaObject.style;

        if(heightOrWidth === "height") {
            var hasNoWidth = !styleAsObject.hasOwnProperty("width");
            var hasNoMinWidth = !styleAsObject.hasOwnProperty("min-width");
            var hasNoMaxWidth = !styleAsObject.hasOwnProperty("max-width");

            return hasNoWidth && hasNoMinWidth && hasNoMaxWidth;
        }

        if(heightOrWidth === "width") {
            var hasNoHeight = !styleAsObject.hasOwnProperty("height");
            var hasNoMinHeight = !styleAsObject.hasOwnProperty("min-height");
            var hasNoMaxHeight = !styleAsObject.hasOwnProperty("max-height");

            return hasNoHeight && hasNoMinHeight && hasNoMaxHeight;
        }

        return true;
    },

    willHeightRuleNotInvalidateMaxWidth: function(estimatedWidth) {
        var player = this.props.data.player;

        var maxWidthForElement = player.clientWidth;

        return estimatedWidth < maxWidthForElement;
    },

    addStyle: function (element, style) {
            var cssText = element.style.cssText;
            _.forEach(Object.keys(style), function (styleKey) {
                // APEP Only apply CSS rules that are not position absolute declaration, the media-object CSS class already implements this rule.  This is a hack for an ugly bug
                // Angel P:For the specific case of seeting border-image before border, which results in it being discarded
                // I have switched this to build up css text instead applying values to keys in the element style
                if (!(styleKey === "position" && style[styleKey] === "absolute")) {
                    // element.style[styleKey] = style[styleKey]
                    cssText =  styleKey + ":" + style[styleKey] +";" + cssText;
                }
            });
            element.style.cssText = cssText;
    },
    calcDimension: function (player, dim, element) {
        var elementDimensionSize = element[dim];
        var playerDimensionSize = player[dim];
        var min = 0;
        var max = playerDimensionSize - elementDimensionSize;
        var finalPosition = _.random(min, max);
        return Math.round(finalPosition) + 'px';
    },

    positionElement: function (el) {
        var element = el || this.refs.object.refs[this.props.data.mediaObject._obj._id];
        //APEP When mounting component, apply the declared style rules and position if not declared by media objects CSS
        if (!this.doesStyleDeclareMediaObjectPosition(this.props.data.mediaObject.style)) {
            this.placeAtRandomPosition(element);
        }
    },

    placeAtRandomPosition: function (element) {
        var player = this.props.data.player;
        if (!element.style) {
            element.style = {}
        }
        element.style.left = this.calcDimension(player, 'clientWidth', element);
        element.style.top = this.calcDimension(player, 'clientHeight', element);
    },

    mediaObjectClicked: function (e) {
        e.preventDefault(); //APEP ensure no default action such as form submission is triggered from click

        var element = this.refs.object.refs[this.props.data.mediaObject._obj._id];

        // APEP set the z index for the media object to the next z-index
        // APEP we will eventually run out, but z index goes up to max 32bit int.. should be large enough
        element.style["z-index"] = MediaObject.zIndexCounter++;
    },

    render: function () {
        var components = {
            text: TextMediaObject,
            image: ImageMediaObject,
            video: VideoMediaObject,
            audio: AudioMediaObject
        };

        var Object = components[this.props.data.mediaObject._obj.type];

        return (
            <div className="mO">
                <Object ref="object" data={this.props.data}
                        clickHandler={this.mediaObjectClicked}
                        positionElementHandler={this.positionElement}
                        addStyleHandler={this.addStyle}
                        canMediaObjectProvideDefaultSize={this.canMediaObjectProvideDefaultSize}
                        willHeightRuleNotInvalidateMaxWidth={this.willHeightRuleNotInvalidateMaxWidth} />
            </div>
        );
    }
});
module.exports = MediaObject;
