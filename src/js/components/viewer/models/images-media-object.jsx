'use strict';
var React = require('react');
var classNames = require('classnames');


var ImageMediaObject = React.createClass({

    playTimeout: null,

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
        console.log("image play",element)
        element.style.transition = 'opacity ' + (self.props.data.transitionDuration / 1000) + 's ease-in-out';
        self.setState({shown: true});
        this.playTimeout = setTimeout(function () {
                self.transition();
            }, self.props.data.displayDuration
        );
    },
    transition: function () {

        //APEP Clear the time out if transition is called outside rather than trigger by self
        try {
            if (this.playTimeout) clearTimeout(this.playTimeout);
        } catch (e) {
            console.log("ImageMediaObject - failed to clear timeout for playTimeout");
        }

        var self = this;
        try {
            self.setState({shown: false});

            if (self.props.data.mediaObject) {
                setTimeout(function () {
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
