'use strict';

// APEP Picture In Picture prototyping

var React = require('react');
var IFrame = require('react-iframe');
var GraphViewer = require('../../pages/viewer/graph-viewer.jsx');

var PictureInPicture = React.createClass({

    getInitialState: function() {
        return {
            pictureInPictureStyle: {
                position: "absolute",
                "z-index": 99999999,
                top: "5%",
                left: "5%",
                right: "65%",
                bottom: "65%"
            },
            activeButton: "top-left"
        }
    },

    topLeftButton: function() {
        var pictureInPictureStyle = this.state.pictureInPictureStyle;

        pictureInPictureStyle.top = "5%";
        pictureInPictureStyle.left = "5%";
        pictureInPictureStyle.right = "65%";
        pictureInPictureStyle.bottom = "65%";

        this.setState({pictureInPictureStyle: pictureInPictureStyle, activeButton: "top-left"});
    },

    topRightButton: function() {
        var pictureInPictureStyle = this.state.pictureInPictureStyle;

        pictureInPictureStyle.top = "5%";
        pictureInPictureStyle.left = "65%";
        pictureInPictureStyle.right = "5%";
        pictureInPictureStyle.bottom = "65%";

        this.setState({pictureInPictureStyle: pictureInPictureStyle, activeButton: "top-right"});
    },

    bottomLeftButton: function() {
        var pictureInPictureStyle = this.state.pictureInPictureStyle;

        pictureInPictureStyle.top = "65%";
        pictureInPictureStyle.left = "5%";
        pictureInPictureStyle.right = "65%";
        pictureInPictureStyle.bottom = "5%";

        this.setState({pictureInPictureStyle: pictureInPictureStyle, activeButton: "bottom-left"});
    },

    bottomRightButton: function() {
        var pictureInPictureStyle = this.state.pictureInPictureStyle;

        pictureInPictureStyle.top = "65%";
        pictureInPictureStyle.left = "65%";
        pictureInPictureStyle.right = "5%";
        pictureInPictureStyle.bottom = "5%";

        this.setState({pictureInPictureStyle: pictureInPictureStyle, activeButton: "bottom-right"});
    },

    render: function() {

        var pictureInPictureHolder = {
            height: "100%",
            width: "100%"
        };

        var topLeftButtonClassNames     = "btn " + (this.state.activeButton === "top-left" ? " btn-primary" : " btn-default");
        var topRightButtonClassNames    = "btn " + (this.state.activeButton === "top-right" ? " btn-primary" : " btn-default");
        var bottomLeftButtonClassNames  = "btn " + (this.state.activeButton === "bottom-left" ? " btn-primary" : " btn-default");
        var bottomRightButtonClassNames = "btn " + (this.state.activeButton === "bottom-right" ? " btn-primary" : " btn-default");

        // APEP TODO handle roomId used in IFRAME component to be non hardcoded, IE use the react lib to find the url query and populate through to the IFRAME link
        return (
            <div style={pictureInPictureHolder}>

                <GraphViewer></GraphViewer>

                <div className="picture-in-picture-graph-holder" style={this.state.pictureInPictureStyle}>

                    <div style={{height: "10%", width: "100%"}}>
                        <button className={topLeftButtonClassNames} onClick={this.topLeftButton}>0,0</button>
                        <button className={topRightButtonClassNames} onClick={this.topRightButton}>0,1</button>
                        <button className={bottomLeftButtonClassNames} onClick={this.bottomLeftButton}>1,0</button>
                        <button className={bottomRightButtonClassNames} onClick={this.bottomRightButton}>1,1</button>
                    </div>

                    <IFrame url="http://dev-uos-mediahubgraph.azurewebsites.net/?id=586f958fb8678acc10b1597f&roomId=presentation"></IFrame>

                </div>
            </div>
        )
    }
});

module.exports = PictureInPicture;
