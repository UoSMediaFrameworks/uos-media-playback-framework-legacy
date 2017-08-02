'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneGraphList = require('../scene-graph-list.jsx');
var FormHelper = require('../../mixins/form-helper');
var ConnectionCache = require('../../utils/connection-cache');
var Select = require('react-select');

var mediaHubGraphURL = process.env.MEDIA_HUB_GRAPH_URL || "";
var presentationNamespaceQueryParams = "?roomId=presentation";
var presentationMediaHubGraphURL = mediaHubGraphURL.length > 0 ? mediaHubGraphURL + presentationNamespaceQueryParams : "";
var graphViewerUrl = "graph-viewer.html#/";
var presentationViewerNamespaceQueryParams = "?room=presentation";
var presentationGraphViewerUrl = graphViewerUrl + presentationViewerNamespaceQueryParams;

var SceneGraphChooser = React.createClass({

    mixins: [FormHelper],

    getInitialState: function () {

        var initFilters = '{"value": "GDC_SCENE_GRAPH","filterText": null,"filterGroupId": null,"sortBy":null}'
        try {
            return JSON.parse(localStorage.getItem('scene-graph-filters') || initFilters);
        } catch (E) {
            console.log("err", E)
        }
    },
    handleFilterUpdate: function (e) {
        if (e.key === 'Enter') {
            var input = this.refs["filter"];
            this.setState({filterText: input.value});
        }
    },
    componentDidMount: function () {
        this.refs["filter"].value = this.state.filterText;
    },
    componentDidUpdate: function () {
        this.refs["filter"].value = this.state.filterText;
    },
    _onSort(event)
    {
        this.setState({sortBy: event.target.value});
    },
    getGroupOptions: function () {
        var options = ConnectionCache.getGroupNameArray();
        var optionsArr = [{value: "None", label: "None"}];
        options.forEach(function (value, key) {
            optionsArr.push({value: key, label: value});
        });
        return optionsArr;
    },
    render: function () {
        localStorage.setItem('scene-graph-filters', JSON.stringify(this.state));
        return (

                <div>
                        <div className="col-xs-12">
                            <div className="sort-section">
                                <h4>Filter</h4>
                                <input type='text' ref="filter" onKeyPress={this.handleFilterUpdate}
                                       className='form-control' placeholder='scene name'/>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="sort-section">
                                <h4>Sort by</h4>
                                <button type="button" className="btn btn-dark" value="asc" onClick={this._onSort}>
                                    Name Asc
                                </button>
                                <button type="button" className="btn btn-dark" value="desc" onClick={this._onSort}>
                                    Name Desc
                                </button>
                            </div>
                        </div>
                    <div className='col-xs-12'>
                        <h4>Edit an Existing Scene Graph</h4>
                        <SceneGraphList  filterText={this.state.filterText} _sceneGraphFocusHandler={this.props.sceneGraphFocusHandler} sortBy={this.state.sortBy}/>
                    </div>


                    <div className="col-xs-12">
                        <h4>Open Presentation Graphs</h4>
                        <ul className="graph-type-buttons">
                            <a className='btn btn-dark' href={presentationMediaHubGraphURL}>
                                <li key="primary">Default Graph</li>
                            </a>
                            <a className='btn btn-dark' href={presentationGraphViewerUrl}>
                                <li key="primary">Default Viewer</li>
                            </a>
                        </ul>
                    </div>
                </div>
        );
    }

});

module.exports = SceneGraphChooser;

