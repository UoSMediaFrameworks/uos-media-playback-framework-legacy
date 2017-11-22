var React = require("react");
var classNames = require('classnames');
var d3 = require("d3");
var ReactDOM = require("react-dom")
var transition = d3.transition()
    .duration(5000)
    .ease(d3.easeCubicInOut);

var Path = React.createClass({

    componentWillMount:function(){

        var diagonal = [
            "M", this.props.data.source.cx, this.props.data.source.cy,
            "A", this.props.innerH, this.props.innerH, 0, 0, 1, this.props.data.target.cx, this.props.data.target.cy
        ].join(" ");

        this.setState({diagonal:diagonal})
    },
    componentWillReceiveProps:function(nextProps){
        var link = d3.select(ReactDOM.findDOMNode(this));
        var self =this;
        var diagonal = [
            "M", nextProps.data.source.cx, nextProps.data.source.cy,
            "A", nextProps.innerH, nextProps.innerH, 0, 0, 1, nextProps.data.target.cx, nextProps.data.target.cy
        ].join(" ");


        link.transition().ease(d3.easeCubicInOut).duration(3000)
            .attr("d",diagonal)
            .on('end',function(){
                    self.setState({
                        diagonal:diagonal
                    });
                }
            )
    },
    componentWillUnmount:function(){
        var link = d3.select(ReactDOM.findDOMNode(this));
        link.transition()
    },
    render(){
        /* console.log(this.props.data)*/
        var classes = classNames({
            'opaque': false,
            'visible-path': this.props.data.visible,
            'highlightedLink':this.props.data.highlighted
        });



        return (<path d={this.state.diagonal} className={classes}>

        </path>);

    }
});

module.exports = Path;
