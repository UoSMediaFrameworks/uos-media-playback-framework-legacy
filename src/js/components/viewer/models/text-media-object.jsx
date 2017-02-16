'use strict';
var React = require('react');
var classNames = require('classnames');


var TextMediaObject = React.createClass({
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

        // APEP Force the shown update with some buffering time between DOM render and starting an animation
        setTimeout(function(){
            this.setState({shown: true});
        }.bind(this), 50);

        this.playTimeout = setTimeout(function () {
                self.transition()
            }, self.props.data.displayDuration
        );
    },
    transition: function () {
        // console.log("TextMediaObject - transition - Text transition call made: ", this.props.data.mediaObject._obj.text);

        if(this.playTimeout) clearTimeout(this.playTimeout);

        var self = this;

        self.setState({shown: false});

        if(self.props.data.mediaObject) {
            setTimeout(function () {
                self.props.data.moDoneHandler(self);
            }, self.props.data.transitionDuration)
        }
    },
    render: function () {

        var style = {
            "transition": 'opacity ' + (this.props.data.transitionDuration / 1000) + 's ease-in-out'
        };

        var objectClasses = classNames({
            "text-media-object": true,
            "media-object": true,
            "show-media-object": this.state.shown
        });

        return <p style={style} ref={this.props.data.mediaObject._obj._id} className={objectClasses} onClick={this.props.clickHandler}>
                    {this.props.data.mediaObject._obj.text}
              </p>;
    }
});
module.exports = TextMediaObject;

