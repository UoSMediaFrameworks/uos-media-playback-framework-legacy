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

        this.placeAtRandomPosition(element);
    },
    addStyle:function(element, style) {
        lodash.forEach(Object.keys(style), function(styleKey) {
            element.style[styleKey] = style[styleKey];
        });
    },
    calcDimension: function (player, dim, element) {
        var elementDimensionSize = element[dim];
        // console.log("refs",this.refs.player[dim],elementDimensionSize)
        var randomNonOverlapPosition = Math.random() * (this.props.data.player[dim] - elementDimensionSize);
        // allow potential overlap of up to 30% of element's dimension
        var potentialOverlap = lodash.random(-0.3, 0.3) * elementDimensionSize;
        var finalPosition = Math.round(randomNonOverlapPosition + potentialOverlap);
        if (finalPosition <= this.props.data.player[dim] && finalPosition >= 0) {
            return finalPosition + 'px';
        } else if (finalPosition > this.props.data.player[dim]) {
            return this.props.data.player[dim] + 'px';
        } else {
            return 0 + 'px';
        }
        return Math.round(randomNonOverlapPosition + potentialOverlap) + 'px';
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
