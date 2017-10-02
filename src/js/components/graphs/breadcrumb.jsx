var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var Crumbs = require('./crumbs.jsx');
var GraphBreadcrumbActions =require("../../actions/graph-breadcrumb-actions");
var Breadcrumb = React.createClass({
    render(){
        var name = this.props.crumb.name || "crumb" + this.props.index;
        return (
            <div className="crumbs">
                <div className="controls btn-toolbar col-sm-3">
                    <p className="btn-group btn-group-sm">{name}</p>
                    <div className="btn-group btn-group-sm" role="group">
                        <button type="button" className="btn btn-default" >
                            <i className="fa fa-play" onClick={  GraphBreadcrumbActions.playBreadcrumb.bind(this,this.props.index)}></i></button>

                        <button type="button" className="btn btn-default">
                            <i className="fa fa-times" onClick={GraphBreadcrumbActions.removeBreadcrumb.bind(this,this.props.index)} ></i></button>
                        <button type="button" className="btn btn-default" onClick={ GraphBreadcrumbActions.traceBreadcrumb.bind(this,this.props.index)} ><i className="fa fa-ban"></i></button>
                    </div>
                </div>
                <Crumbs crumbs={this.props.crumb.breadcrumbs} parentCrumbIndex={this.props.index}></Crumbs>
            </div>
        )
    }
});


module.exports = Breadcrumb;
