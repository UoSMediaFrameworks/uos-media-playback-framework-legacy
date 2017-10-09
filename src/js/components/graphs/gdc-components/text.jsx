var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");


var Text = React.createClass({
    getInitialState: function () {
        return {}
    },
    componentWillMount:function(){
        var self = this;
        self.setState({
            x: self.props.data.cx,
            y: self.props.data.cy,
            r:self.props.data.r
        });
    },
    calculateTextSize: function () {
        //APt : This can be used if we want the text to be inside the diameter of the circle
        var len = this.props.data.name.substring(0, this.props.data.r / 3).length;
        var size =this.props.data.r / 3;
        size *= 10 / len;
        size += 1;
        return Math.round(size) + 'px';

    },
    componentWillUnmount:function(){
        var text = d3.select(ReactDOM.findDOMNode(this));
        text.transition()
    },
    componentWillReceiveProps: function (nextProps) {
        var text = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        text.transition().ease(d3.easeCubicInOut).duration(3000)
            .attr("x", nextProps.data.cx)
            .attr("y", nextProps.data.cy + (nextProps.data.r +10))
            .on('end', function () {
                self.setState({
                    x: nextProps.data.cx,
                    y: nextProps.data.cy + (nextProps.data.r +10),
                    r:nextProps.data.r
                })
            });
    },
    render(){
        var classes = classNames({
            'gdc-text':true,
            'invisible-text': !this.props.data.textHighlighted ,
        });
        return (
            <text className={classes} x={this.state.x} y={this.state.y} dy=".3em" textAnchor="middle" >
                {this.props.data.name}
            </text>
        )
    }
});

module.exports = Text;
