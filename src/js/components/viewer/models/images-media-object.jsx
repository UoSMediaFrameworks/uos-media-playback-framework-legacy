'use strict';
var React = require('react');
var classNames = require('classnames');

var imageMount = 0;
var imageWillUnmount = 0;

var ImageMediaObject = React.createClass({

    playTimeout: null,

    getInitialState: function () {
        return {
            shown: false
        };
    },
    componentDidMount: function () {
        this.play();
        imageMount++;
        // console.log("Image - componentDidMount - imageMount, imageWillUnmount: ", imageMount, imageWillUnmount);
    },
    componentWillUnmount: function() {
        imageWillUnmount++;
        // console.log("Image - componentDidMount - imageMount, imageWillUnmount: ", imageMount, imageWillUnmount);
    },
    play: function () {
        var self = this;
        var element = self.refs[self.props.data.mediaObject._obj._id];
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

            var self = this;
            self.setState({shown: false});
            setTimeout(function () {
                self.props.data.moDoneHandler(self);
            }, self.props.data.transitionDuration);

        } catch (e) {
            console.log("ImageMediaObject - failed to clear timeout for playTimeout");
        }

    },
    render: function () {
        var objectClasses = classNames({
            "image-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });
        return <img ref={this.props.data.mediaObject._obj._id}
                    className={objectClasses}
                    src={this.props.data.mediaObject._obj.url}
                    onClick={this.props.clickHandler}/>;
    }
});
module.exports = ImageMediaObject;
