var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");
 _ = require("lodash");
var Rectangle = React.createClass({

    componentWillMount:function(){
        var self = this;
        self.setState({
            x: self.props.data.x -50,
            y: self.props.data.y -50,
            width:100,
            height:100,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var node = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        node.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.x -50)
            .attr("y", nextProps.data.y -50)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.x -50,
                    y: nextProps.data.y -50,
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
                    if(doesExist === 1){
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

        var test = this.checkForThumbnails();
        return test != null ? (
            <image
                className={classes}
                x={this.state.x}  width={100}
                y={this.state.y}        height={100}
                href={test}
                clipPath={"url(#"+this.props.clip+")"}
                onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </image>
        ):(

            <rect
                className={classes}
                x={this.state.x }
                y={this.state.y }
                width={100}
                height={100}
                fill={this.state.color}
                clipPath={"url(#"+this.props.clip+")"}
             onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </rect>
        )
    }
});

module.exports = Rectangle;
