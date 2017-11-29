var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");
 _ = require("lodash");
var Rectangle = React.createClass({

    componentWillMount:function(){

        var self = this;
        self.setState({
            x: self.props.data.cx -self.props.data.r,
            y: self.props.data.cy -self.props.data.r,
            r:self.props.data.r,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var node = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        node.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.cx -self.props.data.r)
            .attr("y", nextProps.data.cy -self.props.data.r)
            .attr("width",nextProps.data.r*2)
            .attr("height",nextProps.data.r*2)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.cx -self.props.data.r,
                    y: nextProps.data.cy -self.props.data.r,
                    r:nextProps.data.r,
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
        var thumb = this.checkForThumbnails();
        return thumb != null ? (
            <image
                className={classes}
                x={this.state.x }  width={this.state.r*2}
                y={this.state.y }        height={this.state.r*2}
                href={thumb}
                clipPath={clipVal}
                onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </image>
        ):(

            <rect
                className={classes}
                x={this.state.x }
                y={this.state.y }
                width={this.state.r*2}
                height={this.state.r*2}
                fill={this.state.color}
                clipPath={clipVal}
             onClick={this.props.eventHandler.bind(null, this.props.data)}
            >
            </rect>
        )
    }
});

module.exports = Rectangle;
