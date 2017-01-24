'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneList = require('../scene-list.jsx');
var FormHelper = require('../../mixins/form-helper');
var hat = require('hat');
var ConnectionCache = require('../../utils/connection-cache');
var Select = require('react-select');


var SceneChooser = React.createClass({

    mixins: [FormHelper],
    getInitialState: function () {
        return {
            filterText: null,
            filterGroupId: null,
            sortBy:null
        }
    },
    handleSubmit: function (event) {
        event.preventDefault();
        HubSendActions.tryCreateScene(this.getRefVal('name'));
    },
    handleFilterUpdate: function (e) {
        if (e.key === 'Enter') {
            var input = this.refs["filter"];
            this.setState({filterText: input.value});
        }
    },
    _onSelect: function (e) {
        var element = this.refs['group-filter'];

        this.setState({filterGroupId: e.value});
    },
    _onSort:function(val){

        this.setState({sortBy: null});
    },
    render: function () {
        var options = ConnectionCache.getGroupNameArray();
        var optionsArr = [{value:"None",label:"None"}];
        options.forEach(function(value,key){
            optionsArr.push({value:key,label:value});
        });

        return (
            <div className='container'>
                <div className='row'>
                    <div className='col-xs-6'>
                        <h2>Edit an Existing Scene</h2>
                        <SceneList filterText={this.state.filterText} sortBy={this.state.sortBy} filterGroupId={this.state.filterGroupId}/>
                    </div>
                    <div className='col-xs-6'>
                        <div className="col-xs-12">
                            <h2>Create a new Scene</h2>
                            <form className='form-inline' onSubmit={this.handleSubmit} role='form'>
                                <div className='form-group'>
                                    <input type='text' ref='name' className='form-control' placeholder='name'/>
                                </div>
                                <button type='submit' className='btn btn-default'>Create</button>
                            </form>
                        </div>
                        <div className="col-xs-12">
                            <div className="sort-section">
                                <h2>Filter</h2>
                                <input type='text' ref="filter" onKeyPress={this.handleFilterUpdate}
                                       className='form-control' placeholder='scene name'/>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="sort-section">
                                <h2>Show Only</h2>
                                <Select
                                    ref="group-filter"
                                    name="group-filter"
                                    value={this.state.filterGroupId}
                                    options={optionsArr}
                                    onChange={this._onSelect}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <h4> Example Scenes </h4>
                    </div>
                </div>
            </div>

        );
    }

});

module.exports = SceneChooser;
