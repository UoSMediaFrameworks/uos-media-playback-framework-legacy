var React = require("react");
var d3 = require("d3");
var ReactDOM = require("react-dom");
var classNames = require('classnames');

var Text = React.createClass({
    componentWillMount:function(){
        var self = this;
        self.setState({
            cx: self.props.data.cx,
            cy: self.props.data.cy,
            name:self.props.data.name,
            fontSize:self.calculateTextSize(self.props)
        });
    },
    componentWillReceiveProps:function(nextProps){
        var textNode = d3.select(ReactDOM.findDOMNode(this));
        var self =this;
        textNode.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.cx)
            .attr("y", nextProps.data.cy)
            .attr("font-size",this.calculateTextSize(nextProps))
            .on('end', function () {
                self.setState({
                    cx: nextProps.data.cx,
                    cy: nextProps.data.cy,
                    name:nextProps.data.name,
                    fontSize: self.calculateTextSize(nextProps)
                })
            });
    },
    componentWillUnmount:function(){
        var textNode = d3.select(ReactDOM.findDOMNode(this));
        textNode.transition()
    },
    calculateTextSize: function (props) {

            var len = props.data.name.substring(0, props.data.r / 3).length;
            var size =props.data.r / 3;
            size *= 10 / len;
            size += 1;
            return Math.round(size) + 'px';

    },
    render(){
        return (
            <text x={this.state.cx} y={this.state.cy} dy=".3em" textAnchor="middle" fontSize={this.state.fontSize}>
                {this.state.name}
            </text>
        )
    }
});

module.exports = Text;
