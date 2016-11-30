'use strict';
var React = require('react');
var classNames = require('classnames');

var ImageMediaObject = React.createClass({
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
        setTimeout(function () {
                self.transition()
            }, self.props.data.displayDuration
        );
    },
    transition: function () {
        //console.log("ImageMediaObject - transition - Image transition call made", this);
        //console.log(this)
        var self = this;
        self.setState({shown: false})
        if( self.props.data.mediaObject){
            self.props.data.mediaObject.emit("transition",self.props.data.mediaObject);
            setTimeout(function () {
                self.props.data.mediaObject.emit("done",self.props.data.mediaObject);
                self.props.data.moDoneHandler(self);
            }, self.props.data.transitionDuration)
        }
    },
    render: function () {
        var objectClasses = classNames({
            "image-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });
        return <img ref={this.props.data.mediaObject._obj._id} className={objectClasses}
                    src={this.props.data.mediaObject._obj.url}></img>;
    }
});
module.exports = ImageMediaObject;
