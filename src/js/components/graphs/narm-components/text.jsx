var React = require("react");


var Text = React.createClass({
    getInitialState: function () {
        return {}
    },
    calculateTextSize: function () {

            var len = this.props.data.name.substring(0, this.props.data.r / 3).length;
            var size =this.props.data.r / 3;
            size *= 10 / len;
            size += 1;
            return Math.round(size) + 'px';

    },
    render(){

        return (
            <text x={this.props.data.cx} y={this.props.data.cy} dy=".3em" textAnchor="middle" fontSize={this.calculateTextSize()}>
                {this.props.data.name}
            </text>
        )
    }
});

module.exports = Text;
