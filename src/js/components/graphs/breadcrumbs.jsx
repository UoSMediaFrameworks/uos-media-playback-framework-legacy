
var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var Breadcrumb = require('./breadcrumb.jsx');

var Breadcrumbs = React.createClass({
    getBreacrumbs:function(){
        var reactCrumbs = _.map(this.props.crumbs, function (crumb, i) {
           return( <Breadcrumb key={i} index={i} crumb={crumb}/>);
        });
        return reactCrumbs;
    },
    render(){
        var breadcrumbsList = this.getBreacrumbs();
        return(
            <div id="breadcrumbs-list-container">
                {breadcrumbsList}
            </div>
        )
    }

});

module.exports = Breadcrumbs;
