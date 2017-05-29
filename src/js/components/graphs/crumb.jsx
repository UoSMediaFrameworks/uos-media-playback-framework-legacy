var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');

var Crumb = React.createClass({
    getInitialState: function () {
        return {

        };
    },
    render(){
        return (
            <li>
                <a>{this.props.node + "." + this.props.event}<i className="fa fa-times" onClick={BreadcrumbsStore.removeCrumb.bind(this,this.props)}>
                </i></a>
            </li>
        );
    }
});

module.exports= Crumb;
