var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var GraphBreadcrumbActions =require("../../actions/graph-breadcrumb-actions");

var Crumb = React.createClass({
    getInitialState: function () {
        return {

        };
    },
    render(){
        return (
            <li>
                <a>{this.props.node + "." + this.props.event}<i className="fa fa-times" onClick={GraphBreadcrumbActions.removeCrumb.bind(null,this.props)}>
                </i></a>
            </li>
        );
    }
});

module.exports= Crumb;
