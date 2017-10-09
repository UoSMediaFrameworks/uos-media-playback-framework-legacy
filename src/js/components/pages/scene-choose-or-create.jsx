'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneList = require('../scene-list.jsx');
var FormHelper = require('../../mixins/form-helper');
var hat = require('hat');
var ConnectionCache = require('../../utils/connection-cache');
var Select = require('react-select');
var SelectPlus = require('react-select-plus');
var GridStore = require("../../stores/grid-store.js");



var SceneChooser = React.createClass({

    mixins: [FormHelper],
    getInitialState: function () {
        var initFilters = '{"filterText":"","filterGroupId":null,"sortBy":null}';
        try {
            return JSON.parse(localStorage.getItem('scene-filters') || initFilters);
        } catch (E) {
            console.log("err", E)
        }


    },
    handleFilterUpdate: function (e) {

            var input = this.refs["filter"];
            this.setState({filterText: input.value});

    },
    handleIdFilterUpdate: function(e) {
        var input = this.refs["id_filter"];
        this.setState({filterId: input.value});
    },
    componentWillMount:function(){
      console.log("Will mount",this)
    },
    componentDidMount: function () {
        this.refs["filter"].value = this.state.filterText;
    },
    componentDidUpdate: function () {
        this.refs["filter"].value = this.state.filterText;
    },
    _onSelect: function (e) {
        var element = this.refs['group-filter'];
        this.setState({filterGroupId: e.value});
    },
    _onSort: function (val) {
        this.setState({sortBy: null});
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

        localStorage.setItem('scene-filters', JSON.stringify(this.state));

        var optionsArr = this.getGroupOptions();

        var isAdmin = parseInt(ConnectionCache.getGroupID()) === 0;
        var groupFilter = null;
        var sceneIdFilter = null;
        if (isAdmin) {
            groupFilter =  <div >
                <div className="sort-section">
                    <h5>Show Only</h5>
                    <SelectPlus
                        ref="group-filter"
                        name="group-filter"
                        value={this.state.filterGroupId}
                        options={optionsArr}
                        onChange={this._onSelect}
                    />
                </div>
            </div>;

            sceneIdFilter = <div>
                <div className="sort-section">
                    <input type='text' ref="filter" onKeyUp={this.handleIdFilterUpdate}
                           className='form-control' placeholder='Filter By ID'/>
                </div>
            </div>;
        }

        var sceneNameFilter = <div>
            <div className="sort-section">
                <input type='text' ref="filter" onKeyUp={this.handleFilterUpdate}
                       className='form-control' placeholder='Filter Scene List'/>
            </div>
        </div>;

        return (
            <div id="scene-list">
                <div className='col-md-12'>
                    <h4> Example Scenes </h4>
                    <ul className="nav nav-pills .nav-stacked col-xs-12">
                        <li>
                            <label onClick={GridStore.focusScene.bind(this,"589c9dc3f0b2aca4bdfe444a")}
                             onTouchEndCapture={GridStore.focusScene.bind(this,"589c9dc3f0b2aca4bdfe444a")}>MF Style Example</label>
                        </li>
                    </ul>
                </div>
                <div className='col-xs-12'>
                    <h4>Edit an Existing Scene</h4>
                    {groupFilter}
                    {sceneIdFilter}
                    {sceneNameFilter}

                    <SceneList filterText={this.state.filterText}
                               _sceneFocusHandler={GridStore.focusScene}
                               sortBy={this.state.sortBy}
                               filterGroupId={this.state.filterGroupId}
                               filterById={this.state.filterId}/>
                </div>
            </div>
        );
    }

});

module.exports = SceneChooser;
