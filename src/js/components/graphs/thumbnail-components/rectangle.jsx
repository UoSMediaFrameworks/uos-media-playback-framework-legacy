var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom");
 _ = require("lodash");
var Rectangle = React.createClass({

    componentWillMount:function(){
        var self = this;
        self.setState({
            x: self.props.data.x,
            y: self.props.data.y,
            width:120,
            height:90,
            color: self.props.data.color
        });
    },
    componentWillReceiveProps: function (nextProps) {
        var node = d3.select(ReactDOM.findDOMNode(this));
        var self = this;
        node.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("x", nextProps.data.x)
            .attr("y", nextProps.data.y)
            .attr("fill", nextProps.data.color)
            .on('end', function () {
                self.setState({
                    x: nextProps.data.x,
                    y: nextProps.data.y,
                    color: nextProps.data.color
                })
            });
    },
    componentWillUnmount:function(){
        var node = d3.select(ReactDOM.findDOMNode(this));
        node.transition()
    },
    checkForThumbnails:function(){
        var thumbnail = null;
        if(this.props.data.childrenRelationshipIds){
            _.each(this.props.data.childrenRelationshipIds,function(child){
              var doesExist =    child.tags.split(',').indexOf("thumbnail");
              if(doesExist === 1){
                  thumbnail = child.url;
              }
            })
        }
        console.log(thumbnail);
      return thumbnail;
    },
    render(){
        var classes = classNames({
            'shown-circle': this.props.data.visible,
            'highlight2': this.props.data.highlighted
        });

        var test = this.checkForThumbnails();
        return test != null ? (
            <image
                className={classes}
                x={this.state.x}
                y={this.state.y}
                width={120}
                height={90}
                href={test}

                /*     onClick={this.props.eventHandler.bind(null, this.props.data)}*/
            >
            </image>
        ):(

            <rect
                className={classes}
                x={this.state.x}
                y={this.state.y}
                width={120}
                height={90}
                fill={this.state.color}
           /*     onClick={this.props.eventHandler.bind(null, this.props.data)}*/
            >
            </rect>
        )
    }
});

module.exports = Rectangle;
