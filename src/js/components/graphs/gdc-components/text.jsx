var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");


var Text = React.createClass({

    componentWillMount:function(){
        var self = this;
        self.setState({
            cx: self.props.data.cx,
            cy: self.props.data.cy + self.props.data.r +10,
            name:self.props.data.name,
            r:self.props.data.r,
            fontSize:self.calculateTextSize(self.props)
        });
    },
    componentWillReceiveProps: function (nextProps) {
        
        var text = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        text.transition().ease(d3.easeCubicInOut).duration(3000)
            .attr("cx", nextProps.data.cx)
            .attr("cy", nextProps.data.cy + (nextProps.data.r +10))
            .attr("font-size",this.calculateTextSize(nextProps))
            .on('end', function () {
                self.setState({
                    cx: nextProps.data.cx,
                    cy: nextProps.data.cy + (nextProps.data.r +10),
                    fontSize:self.calculateTextSize(nextProps)
                })
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

    render(){
        var classes = classNames({
            'gdc-text':true,
        });
        if(!this.props.data.highlighted){
            return null;
        }
        return (
            <text x={this.props.data.cx} y={this.props.data.cy + this.props.data.r + 10} className={classes} dy=".3em" textAnchor="middle" fontSize={this.state.fontSize}>
                {this.state.name}
            </text>
        )
    }
});

module.exports = Text;
