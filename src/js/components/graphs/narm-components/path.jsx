var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom")
var transition = d3.transition()
    .duration(5000)
    .ease(d3.easeCubicInOut);

var Path = React.createClass({

    componentWillMount: function () {
        var self =this;
        var diagonal = [
            "M", this.props.data.source.cx, this.props.data.source.cy,
            "A", 0, 0, 0, 0, 1, this.props.data.target.cx, this.props.data.target.cy
        ].join(" ");

        this.setState({
            diagonal: diagonal,
            visible: self.props.data.visible,
            highlighted: self.props.data.highlighted,
            stroke:this.props.data.highlighted ? "rgb(210, 247, 244)": "black"
        })
    },
    componentWillReceiveProps: function (nextProps) {
        var link = d3.select(ReactDOM.findDOMNode(this));
        var self = this;

        var diagonal = [
            "M", nextProps.data.source.cx, nextProps.data.source.cy,
            "A", 0, 0, 0, 0, 1, nextProps.data.target.cx, nextProps.data.target.cy
        ].join(" ");

        link.transition().ease(d3.easeCubicInOut).duration(5000)
            .attr("d", diagonal)
            .attr('stroke', nextProps.data.highlighted ?  "rgb(210, 247, 244)" : "black")
            .on('end', function () {
                    self.setState({
                        diagonal: diagonal,
                        visible: nextProps.data.visible,
                        highlighted: nextProps.data.highlighted,
                        stroke:nextProps.data.highlighted ? "rgb(210, 247, 244)" : "black"
                    });
                }
            )
    },
    componentWillUnmount: function () {
        var link = d3.select(ReactDOM.findDOMNode(this));
        link.transition()
    },
    render() {
        var self = this;
        /*console.log(this.state)*/
            if (!this.props.data.visible) {

                return null;
            }

        var classes = classNames({
            'opaque': false,
            'visible-path2': self.props.data.visible,
            'highlightedLink2': self.props.data.highlighted
        });


        return (<path d={self.state.diagonal} className={classes} stroke={self.state.stroke}>

        </path>);

    }
});

module.exports = Path;
