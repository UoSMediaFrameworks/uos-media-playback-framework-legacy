var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");
 _ = require("lodash");
var Rectangle = React.createClass({

    componentWillMount:function(){

        var self = this;
        self.setState({
            x: self.props.data.cx -15,
            y: self.props.data.cy -15,
            width:30,
            height:30,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var node = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        node.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.cx -15)
            .attr("y", nextProps.data.cy -15)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.cx -15,
                    y: nextProps.data.cy -15,
                    color:nextProps.data.color
                })
            });
    },
    componentWillUnmount:function(){
        var node = d3.select(ReactDOM.findDOMNode(this));
        node.transition()
    },
    checkForThumbnails:function(){
        var thumbnail = null;
        if(this.props.data.children){
            _.each(this.props.data.children,function(child){
                if(child.type == "image"){
                    var doesExist =    child.tags.split(',').indexOf("thumbnail");
                    if(doesExist !== -1){
                        thumbnail = child.url;
                    }
                }

            })
        }
      return thumbnail;
    },
    render(){
        if(!this.props.data.visible){
            return null;
        }
        var classes = classNames({
            'shown-circle': this.props.data.visible,
            'highlight2': this.props.data.highlighted

        });
        var clipVal = this.props.clip != undefined ? "url(#"+this.props.clip+")": null;
        var test = this.checkForThumbnails();
        return test != null ? (
            <image
                className={classes}
                x={this.state.x }  width={30}
                y={this.state.y }        height={30}
                href={test}
                clipPath={clipVal}
                onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </image>
        ):(

            <rect
                className={classes}
                x={this.state.x }
                y={this.state.y }
                width={30}
                height={30}
                fill={this.state.color}
                clipPath={clipVal}
             onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </rect>
        )
    }
});

module.exports = Rectangle;
