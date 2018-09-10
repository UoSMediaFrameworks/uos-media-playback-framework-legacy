'use strict';
var React = require('react');
var SceneGraphList = require('./scene-graph-list.jsx');
var FormHelper = require('../mixins/form-helper');
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

            var input = this.refs["filter"];
            this.setState({filterText: input.value});

    },
    componentDidMount: function () {
        this.refs["filter"].value = this.state.filterText;
    },
    componentDidUpdate: function () {
        if(this.refs["filter"]){
            this.refs["filter"].value = this.state.filterText;
        }
    },
    _onSort(event) {
        this.setState({sortBy: event.target.value});
    },

    render: function () {
        localStorage.setItem('scene-graph-filters', JSON.stringify(this.state));
        return (
                <div id="scene-graph-list">
                    <div className='col-xs-12'>
                        <h4>Edit an Existing Scene Graph</h4>

                        <div>
                            <div className="sort-section">
                                <h5>Sort by</h5>
                                <button type="button" className="btn btn-dark" value="asc" onClick={this._onSort}>
                                    Name Asc
                                </button>
                                <button type="button" className="btn btn-dark" value="desc" onClick={this._onSort}>
                                    Name Desc
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="sort-section">
                                <input type='text' ref="filter" onKeyUp={this.handleFilterUpdate}
                                       className='form-control' placeholder='Filter Scene Graph List'/>
                            </div>
                        </div>
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

