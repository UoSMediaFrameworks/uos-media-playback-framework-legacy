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
            r: self.props.data.r,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {

        var self = this;

        var hiddenNode = d3.select(this.refs.hiddenCircle);

        hiddenNode.transition().ease(d3.easeCubicInOut).duration(3000)
            .attr("cy", nextProps.data.cy)
            .attr("cx", nextProps.data.cx)
            .attr("x", nextProps.data.x)
            .attr("y", nextProps.data.y)
            .attr("r", nextProps.data.r + 4)
            .attr("fill", nextProps.data.color);

        var node = d3.select(this.refs.circle);

        node.transition().ease(d3.easeCubicInOut).duration(3000)
            .attr("cy", nextProps.data.cy)
            .attr("cx", nextProps.data.cx)
            .attr("x", nextProps.data.x)
            .attr("y", nextProps.data.y)
            .attr("r", nextProps.data.r - 2)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.x,
                    y: nextProps.data.y,
                    cx: nextProps.data.cx,
                    cy: nextProps.data.cy,
                    r: nextProps.data.r,
                    color: nextProps.data.color
                });
            });
    },

    componentWillUnmount:function(){
        var node = d3.select(ReactDOM.findDOMNode(this));
        node.transition()
    },

    render(){
        var classes = classNames({
            'shown-circle': this.props.data.visible,
            'highlight': this.props.data.highlighted
        });
        return (

            <g
                className={classes}
                onClick={this.props.clickHandler.bind(null,this.props.data)}
                onDoubleClick={this.props.dblClickHandler.bind(null, this.props.data)}>

                <circle
                    ref="hiddenCircle"
                    cy={this.state.cy}
                    cx={this.state.cx}
                    r={this.state.r + 4}
                    x={this.state.x}
                    y={this.state.y}
                    opacity={0}
                    fill={"none"}>
                </circle>

                <circle
                    ref="circle"
                    cy={this.state.cy}
                    cx={this.state.cx}
                    r={this.state.r - 2}
                    x={this.state.x}
                    y={this.state.y}
                    fill={this.state.color}>
                </circle>
            </g>

        )
    }
});

module.exports = Circle;
