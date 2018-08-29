var React = require('react');
var Webcam = require('react-webcam');
var ReactDom = require("react-dom");

var WebCamContainer = React.createClass({
    getInitialState: function () {
        return {
            width: 0,
            height: 0
        };
    },
    componentWillReceiveProps: function () {

        var dom = ReactDom.findDOMNode(this);
        this.setState({height: dom.parentElement.clientHeight, width: dom.parentElement.clientWidth})
    },
    render: function () {
        var self = this;
        let webcam = <Webcam
            audio={false}
            height={self.state.height}
            width={self.state.width}
        />;


        return (
            <div>
                {webcam}
            </div>
        );

    }
});

module.exports = WebCamContainer;
