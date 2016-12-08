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
        this.addStyle(element,this.props.data.mediaObject.style);
        if(element.style.position != "absolute")
        {
            this.placeAtRandomPosition(element);
        }

    },
    addStyle:function(element, style) {
        lodash.forEach(Object.keys(style), function(styleKey) {
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
