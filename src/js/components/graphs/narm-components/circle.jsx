var React = require("react");
var classNames = require('classnames');

var Circle = React.createClass({
    getInitialState: function() {
        return {

        }
    },
    render(){
        console.log(this.props)
        var classes = classNames({
                'shown-circle': this.props.data.visible,
                'highlight2': this.props.data.highlighted
        });
        return (
            <circle
                cy={this.props.data.cy}
                cx={this.props.data.cx}
                r={this.props.data.r}
                className={classes}
                x={this.props.data.x}
                y={this.props.data.y}
                fill={this.props.data.color}
                onClick={this.props.eventHandler.bind(this,this.props.data)}
            >
            </circle>
        )
    }
});

module.exports = Circle;
