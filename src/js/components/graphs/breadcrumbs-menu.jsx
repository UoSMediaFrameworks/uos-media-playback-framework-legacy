var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var Breadcrumbs = require("./breadcrumbs.jsx");
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');

var BreadcrumbsMenu = React.createClass({
    getInitialState: function () {
        return {
            recordEnabled: true,
            recordHidden: false,
            finishEnabled: false,
            finishHidden:true,
            pauseEnabled: false,
            pauseHidden:false,
            continueEnabled: false,
            continueHidden:true,
            inputHidden:true
        }
    },
    record(){
        BreadcrumbsStore.startRecording(true);
        this.setState({pauseEnabled:true,finishEnabled:true,finishHidden:false,recordHidden:true});
    },
    finish(){

        this.setState({recordEnabled:true,pauseEnabled:false,finishHidden:true,recordHidden:false,inputHidden:false});
    },
    pause(){
        BreadcrumbsStore.pauseRecording();
        this.setState({finishEnabled:false,continueEnabled:true,continueHidden:false,pauseHidden:true});
    },
    continue(){
        BreadcrumbsStore.continueRecording();
        this.setState({pauseHidden:false,finishEnabled:true,continueHidden:true});
    },
    importBreadcrumbs(){
        console.log("importing breadcrumbs")
    },
    exportBreadcrumbs(){
        var element = document.createElement('a');
        var content = this.props.breadcrumbsList;
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(content)));
        element.setAttribute('download', "gdc-graph-id-" + self.graphId + "-crumbs");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },


    breadcrumbsNameHandler:function(e){
        var self = this;
        if (e.keyCode == 13) {
            BreadcrumbsStore.editName(e.target.value);
            BreadcrumbsStore.finishRecording(true);
            self.setState({inputHidden:true,recordEnabled:true,pauseEnabled:true});
        }
    },
    render(){


        var breadcrumbsClasses = classes({
            'visible': this.props.breadcrumbsToggle,
            'hidden': !this.props.breadcrumbsToggle
        });

        var breadCrumbList = this.props.breadcrumbsList || [];
        return (
            <div id="crumbs-container" className={breadcrumbsClasses}>
                <div id="global-controls">
                    <button id="crmbs-clear-all" className="btn btn-default" onClick={BreadcrumbsStore.clearBreadcrumbs}>Remove All</button>
                    <button id="crmbs-export" className="btn btn-default" onClick={this.exportBreadcrumbs}>Export</button>
                    <button id="record" disabled={!this.state.recordEnabled} hidden={this.state.recordHidden} onClick={this.record} className="btn btn-default"><i className="fa fa-circle">Record</i>
                    </button>
                    <button id="finish" disabled={!this.state.finishEnabled} hidden={this.state.finishHidden} onClick={this.finish}  className="btn btn-default"><i className="fa fa-stop">Finish</i>
                    </button>
                    <button id="pause" disabled={!this.state.pauseEnabled} hidden={this.state.pauseHidden} onClick={this.pause} className="btn btn-default"><i className="fa fa-pause">Pause</i></button>
                    <button id="continue" disabled={!this.state.continueEnabled} hidden={this.state.continueHidden} onClick={this.continue} className="btn btn-default"><i className="fa fa-play">Continue</i>
                    </button>
                    <input id="breadcrumbs-name-input"  hidden={this.state.inputHidden} onKeyUp={this.breadcrumbsNameHandler} placeholder="Please enter name"></input>
                    <label id="import-input-label" className="custom-file-upload">
                        <input id="crmbs-import" type="file"></input>
                        <i className="fa fa-cloud-upload" onClick={this.importBreadcrumbs}>Import</i>
                    </label>
                </div>
                <Breadcrumbs crumbs={breadCrumbList}/>
            </div>
        )
    }
});

module.exports = BreadcrumbsMenu;
