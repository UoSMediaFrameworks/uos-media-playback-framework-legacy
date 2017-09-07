'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneList = require('../scene-list.jsx');
var FormHelper = require('../../mixins/form-helper');
var hat = require('hat');
var ConnectionCache = require('../../utils/connection-cache');
var Select = require('react-select');
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
        if (e.key === 'Enter') {
            var input = this.refs["filter"];
            this.setState({filterText: input.value});
        }
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
        var isAdmin = ConnectionCache.getGroupID() == 0 ? 1:0;
        var groupFilter = isAdmin ? <div className="col-xs-12">
            <div className="sort-section">
                <h4>Show Only</h4>
                <Select
                    ref="group-filter"
                    name="group-filter"
                    value={this.state.filterGroupId}
                    options={optionsArr}
                    onChange={this._onSelect}
                />
            </div>
        </div> : null ;


        return (

                <div id="scene-list">
                    <div >
                        <div className="col-xs-12">
                            <div className="sort-section">
                                <h4>Filter</h4>
                                <input type='text' ref="filter" onKeyPress={this.handleFilterUpdate}
                                       className='form-control' placeholder='scene name'/>
                            </div>
                        </div>
                        {groupFilter}
                    </div>
                    <div className='col-md-12'>
                        <h4> Example Scenes </h4>
                        <ul className="nav nav-pills .nav-stacked col-xs-12">
                            <li className="col-xs-12">
                                <label onClick={GridStore.focusScene.bind(this,"589c9dc3f0b2aca4bdfe444a")}
                                 onTouchEndCapture={GridStore.focusScene.bind(this,"589c9dc3f0b2aca4bdfe444a")}>MF Style Example</label>
                            </li>
                        </ul>
                    </div>
                    <div className='col-xs-12'>
                        <h4>Edit an Existing Scene</h4>
                        <SceneList filterText={this.state.filterText} _sceneFocusHandler={this.props.sceneFocusHandler} sortBy={this.state.sortBy}
                                   filterGroupId={this.state.filterGroupId}/>

                    </div>


                </div>


        );
    }

});

module.exports = SceneChooser;
