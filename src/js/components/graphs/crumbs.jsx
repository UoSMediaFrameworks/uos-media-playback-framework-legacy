var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var Crumb = require('./crumb.jsx');

var Crumbs = React.createClass({
    getInitialState: function () {
        return {};
    },
    getCrumbs:function(){
        var self =this;
        var crumbs = _.map(this.props.crumbs,function(crumb,index){
            return (
                <Crumb key={index} index={index} parentIndex={self.props.parentCrumbIndex} node={crumb.node} event={crumb.event}/>
            )
        });
        return crumbs;
    },
    render(){
        var crumbs = this.getCrumbs();
        return (
            <ul className="col-sm-9">
                {crumbs}
            </ul>
        );
    }
});

module.exports= Crumbs;
