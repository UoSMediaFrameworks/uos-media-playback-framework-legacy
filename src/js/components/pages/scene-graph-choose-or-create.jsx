'use strict';
var React = require('react');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneGraphList = require('../scene-graph-list.jsx');
var FormHelper = require('../../mixins/form-helper');

var SceneGraphChooser = React.createClass({

    mixins: [FormHelper],

    getInitialState: function() {
        return {
            value: "GDC_SCENE_GRAPH" //APEP store the value of the select HTML element
        }
    },

    handleSubmit: function(event) {
        event.preventDefault();
        HubSendActions.tryCreateSceneGraph(this.getRefVal('name'), this.state.value);
    },

    handleChange(event) {
        this.setState({value: event.target.value});
    },

    render: function() {

        return (
            <div className='container'>
                <div className='row'>
                    <div className='col-md-6'>
                        <h2>Edit an Existing Scene Graph</h2>
                        <SceneGraphList />

                    </div>
                    <div className='col-md-6'>
                        <h2>Create a new Scene Graph</h2>
                        <form className='form-inline' onSubmit={this.handleSubmit} role='form'>

                            <div class="input-group">
                                <input type='text' ref='name' className='form-control' placeholder='name' />
                                <span class="input-group-addon" id="basic-addon2">
                                    <select className="form-control" value={this.state.value} onChange={this.handleChange}>
                                        <option value="GDC_SCENE_GRAPH">GDC</option>
                                        <option value="MEMOIR_SCENE_GRAPH">Memoir</option>
                                    </select>
                                </span>
                                <button type='submit' className='btn btn-default'>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = SceneGraphChooser;

