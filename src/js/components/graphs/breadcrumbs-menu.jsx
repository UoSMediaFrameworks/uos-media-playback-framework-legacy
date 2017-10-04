var React = require("react");
var classes = require('classnames');
var _ = require('lodash');
var Breadcrumbs = require("./breadcrumbs.jsx");
var GraphBreadcrumbActions = require("../../actions/graph-breadcrumb-actions");
var BreadcrumbsMenu = React.createClass({
    getInitialState: function () {
        return {
            recordEnabled: true,
            recordHidden: false,
            finishEnabled: false,
            finishHidden: true,
            pauseEnabled: false,
            pauseHidden: false,
            continueEnabled: false,
            continueHidden: true,
            inputHidden: true
        }
    },
    record() {
        GraphBreadcrumbActions.startRecording();
        this.setState({
            pauseEnabled: true,
            finishEnabled: true,
            finishHidden: false,
            recordHidden: true,
            inputHidden: false
        });
    },
    finish() {
        GraphBreadcrumbActions.editRecordingName(this.refs.breadcrumbName.value);
        GraphBreadcrumbActions.finishRecording();
        this.setState({
            recordEnabled: true,
            pauseEnabled: true,
            finishHidden: true,
            recordHidden: false,
            inputHidden: true
        });
    },
    pause() {
        GraphBreadcrumbActions.pauseRecording();
        this.setState({finishEnabled: false, continueEnabled: true, continueHidden: false, pauseHidden: true});
    },
    continue() {
        GraphBreadcrumbActions.continueRecording();
        this.setState({pauseHidden: false, finishEnabled: true, continueHidden: true});
    },
    importBreadcrumbs(e) {
        var files = e.target.files; // FileList object

        // use the 1st file from the list
        f = files[0];

        var reader = new FileReader();
        reader.onload = function (event) {
            var parsedText = JSON.parse(event.target.result);
            GraphBreadcrumbActions.importCrumbs({
                content: parsedText,
            })
        };
        reader.readAsText(f);
    },
    exportBreadcrumbs() {
        var self = this;
        var element = document.createElement('a');
        var content = this.props.breadcrumbsList;
        var object = {
            graphId: self.props.graphId,
            content: content
        };
        content[0].graphId = self.props.graphId;
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(object)));
        element.setAttribute('download', self.props.type + "-id-" + self.props.graphId + "-crumbs");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },


    render() {
        var breadcrumbsClasses = classes({
            'visible': this.props.breadcrumbsToggle,
            'hidden': !this.props.breadcrumbsToggle
        });

        var breadCrumbList = this.props.breadcrumbsList || [];
        return (
            <div id="crumbs-container" className={breadcrumbsClasses}>
                <div id="global-controls">
                    <button id="crmbs-clear-all" className="btn btn-default"
                            onClick={GraphBreadcrumbActions.clearAllBreadcrumbs}>Remove All
                    </button>
                    <button id="crmbs-export" className="btn btn-default" onClick={this.exportBreadcrumbs}>Export
                    </button>
                    <button id="record" disabled={!this.state.recordEnabled} hidden={this.state.recordHidden}
                            onClick={this.record} className="btn btn-default"><i className="fa fa-circle">Record</i>
                    </button>
                    <button id="finish" disabled={!this.state.finishEnabled} hidden={this.state.finishHidden}
                            onClick={this.finish} className="btn btn-default"><i className="fa fa-stop">Finish</i>
                    </button>
                    <button id="pause" disabled={!this.state.pauseEnabled} hidden={this.state.pauseHidden}
                            onClick={this.pause} className="btn btn-default"><i className="fa fa-pause">Pause</i>
                    </button>
                    <button id="continue" disabled={!this.state.continueEnabled} hidden={this.state.continueHidden}
                            onClick={this.continue} className="btn btn-default"><i className="fa fa-play">Continue</i>
                    </button>
                    <input id="breadcrumbs-name-input" className="breadcrumbsInput" hidden={this.state.inputHidden}
                           ref="breadcrumbName" placeholder="Please enter name and press finish"></input>
                    <label id="import-input-label" className="custom-file-upload">
                        <input id="crmbs-import" type="file" onChange={this.importBreadcrumbs}></input>
                        <i className="fa fa-cloud-upload">Import</i>
                    </label>
                </div>
                <Breadcrumbs crumbs={breadCrumbList}/>
            </div>
        )
    }
});

module.exports = BreadcrumbsMenu;
