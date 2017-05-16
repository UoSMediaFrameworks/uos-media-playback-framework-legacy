var React = require("react");
var classNames = require('classnames');

var Path = React.createClass({
    getInitialState: function() {
        return {

        }
    },
    render(){
       /* console.log(this.props.data)*/
        var classes = classNames({
            'opaque': false,
            'visible-path2': this.props.data.visible,
            'highlightedLink2':this.props.data.highlighted
        });
        var diagonal = [
            "M", this.props.data.source.cx, this.props.data.source.cy,
            "A", 0, 0, 0, 0, 1, this.props.data.target.cx, this.props.data.target.cy
        ].join(" ");
        return (<path d={diagonal} className={classes}>

            </path>);

    }
});

module.exports = Path;
