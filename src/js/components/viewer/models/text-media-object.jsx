'use strict';
var React = require('react');
var classNames = require('classnames');

var playTimeout;

var TextMediaObject = React.createClass({
    getInitialState: function () {
        return {
            shown: false
        };
    },
    componentDidMount: function () {
        this.play();
    },
    play: function () {
        var self = this;
        var element = self.refs[self.props.data.mediaObject._obj._id];
        element.style.transition = 'opacity ' + (self.props.data.transitionDuration / 1000) + 's ease-in-out';
        self.setState({shown: true});
        playTimeout = setTimeout(function () {
                self.transition()
            }, self.props.data.displayDuration
        );
    },
    transition: function () {
        // console.log("TextMediaObject - transition - Text transition call made", this);

        if(playTimeout) clearTimeout(playTimeout);

        var self = this;
        self.setState({shown: false});
        if(self.props.data.mediaObject) {
            self.props.data.mediaObject.emit("transition",self.props.data.mediaObject);
            setTimeout(function () {
                self.props.data.mediaObject.emit("done",self.props.data.mediaObject);
                self.props.data.moDoneHandler(self);
            }, self.props.data.transitionDuration)
        }
    },
    render: function () {
        var objectClasses = classNames({
            "text-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });

        return <p ref={this.props.data.mediaObject._obj._id}
                  className={objectClasses}>{this.props.data.mediaObject._obj.text}</p>;
    }
});
module.exports = TextMediaObject;

