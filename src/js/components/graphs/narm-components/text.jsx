var React = require("react");
var d3 = require("d3");
var ReactDOM = require("react-dom");
var classNames = require('classnames');

var Text = React.createClass({
    componentWillMount:function(){
        var self = this;
        console.log("calc",self.props.data.cy,self.calculateTextSize(self.props)/2,self.props.data.r, (self.calculateTextSize(self.props)/2 + self.props.data.r));
        self.setState({
            cx: self.props.data.cx,
            cy: self.props.data.cy - (self.calculateTextSize(self.props)/2 + self.props.data.r),
            name:self.props.data.name,
            fontSize:self.calculateTextSize(self.props) + 'px'
        });
    },
    componentWillReceiveProps:function(nextProps){
        var textNode = d3.select(ReactDOM.findDOMNode(this));
        var self =this;
        textNode.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.cx)
            .attr("y", nextProps.data.cy  - (self.calculateTextSize(self.props)/2 + self.props.data.r))
            .attr("font-size",this.calculateTextSize(nextProps) + 'px')
            .on('end', function () {
                self.setState({
                    cx: nextProps.data.cx,
                    cy: nextProps.data.cy  - (self.calculateTextSize(self.props)/2 + self.props.data.r),
                    name:nextProps.data.name,
                    fontSize: self.calculateTextSize(nextProps)+ 'px'
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
            return Math.round(size);

    },
    render(){
        if(!this.props.data.visible){
            return null;
        }
        return (
            <text x={this.state.cx} y={this.state.cy} fill={"white"} className={"Ceramic2Text"} dy=".35em" textAnchor="middle" fontSize={this.state.fontSize}>
                {this.state.name}
            </text>
        )
    }
});

module.exports = Text;
