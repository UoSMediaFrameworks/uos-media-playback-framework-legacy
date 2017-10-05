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
        imageMount++;
        // console.log("Image - componentDidMount - imageMount, imageWillUnmount: ", imageMount, imageWillUnmount);
    },
    componentWillUnmount: function() {
        imageWillUnmount++;

        // APEP as this component is being unmounted, we do not need the media object to call its own transition
        if (this.playTimeout) clearTimeout(this.playTimeout);
    },
    play: function () {
        var self = this;

        // APEP Force the shown update with some buffering time between DOM render and starting an animation
        setTimeout(function(){
            this.setState({shown: true});
        }.bind(this), 50);

        this.playTimeout = setTimeout(function () {
                self.transition();
            }, self.props.data.displayDuration
        );
    },
    transition: function (forceCleared) {
        //APEP Clear the time out if transition is called outside rather than trigger by self
        var self = this;

        try {
            if (this.playTimeout) clearTimeout(this.playTimeout);
            self.setState({shown: false});

            // APEP if we are not force clearing, we can transition smoothly
            if(!forceCleared) {
                setTimeout(function () {
                    self.props.data.moDoneHandler(self);
                }, self.props.data.transitionDuration);
            } else {
                self.props.data.moDoneHandler(self);
            }
        } catch (e) {
            console.log("ImageMediaObject - failed to clear timeout for playTimeout");
        }
    },

    // APEP when the image has loaded can call the play function after positioning the element now we have the sizes
    handleImageLoaded: function() {
        var element = this.refs[this.props.data.mediaObject._obj._id];
        this.props.positionElementHandler(element);
        this.play();
    },

    render: function () {

        var style = {
            "transition": 'opacity ' + (this.props.data.transitionDuration / 1000) + 's ease-in-out'
        };

        var objectClasses = classNames({
            "image-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });

        return <img ref={this.props.data.mediaObject._obj._id}
                    style={style}
                    className={objectClasses}
                    src={this.props.data.mediaObject._obj.url}
                    onClick={this.props.clickHandler}
                    onLoad={this.handleImageLoaded}/>;
    }
});
module.exports = ImageMediaObject;
