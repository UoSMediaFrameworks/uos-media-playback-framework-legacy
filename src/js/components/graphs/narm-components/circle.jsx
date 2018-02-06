var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");

var Circle = React.createClass({

    componentWillMount:function(){
        var self = this;
        self.setState({
            x: self.props.data.x,
            y: self.props.data.y,
            cx: self.props.data.cx,
            cy: self.props.data.cy,
            r: self.props.data.r*1.5,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var node = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        node.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("cy", nextProps.data.cy)
            .attr("cx", nextProps.data.cx)
            .attr("x", nextProps.data.x)
            .attr("y", nextProps.data.y)
            .attr("r", nextProps.data.r*1.5)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.x,
                    y: nextProps.data.y,
                    cx: nextProps.data.cx,
                    cy: nextProps.data.cy,
                    r: nextProps.data.r*1.5,
                    color: nextProps.data.color
                })
            });
    },
    componentWillUnmount:function(){
        var node = d3.select(ReactDOM.findDOMNode(this));
        node.transition()
    },
    render(){
        if(!this.props.data.visible){
            return null;
        }
        var classes = classNames({
            'shown-circle': this.props.data.visible,
            'highlight2': this.props.data.highlighted
        });
        /*       */
        return (
            <circle
                cy={this.state.cy}
                cx={this.state.cx}
                r={this.state.r}
                className={classes}
                x={this.state.x}
                y={this.state.y}
                fill={this.state.color}
                onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </circle>
        )
    }
});

module.exports = Circle;
