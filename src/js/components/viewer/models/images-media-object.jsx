'use strict';
var React = require('react');
var classNames = require('classnames');

var playTimeout;

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
        playTimeout = setTimeout(function () {
                self.transition();
            }, self.props.data.displayDuration
        );
    },
    transition: function () {

        //APEP Clear the time out if transition is called outside rather than trigger by self

        try {
            if (playTimeout) clearTimeout(playTimeout);
        } catch (e) {
            console.log("ImageMediaObject - failed to clear timeout for playTimeout");
        }

        var self = this;
        try {
            self.setState({shown: false});

            console.log("ImageMediaObject - transition - Image transition call made", this);

            if (self.props.data.mediaObject) {
                self.props.data.mediaObject.emit("transition", self.props.data.mediaObject);

                console.log("ImageMediaObject - transition - Image transition call made 2", this);

                setTimeout(function () {
                    console.log("ImageMediaObject - transition - Image transition call made 3", self);
                    self.props.data.moDoneHandler(self);
                }, self.props.data.transitionDuration);
            }

        } catch (e) {
            console.log("ImageMediaObject - Failed to transition - this: ", this);
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
