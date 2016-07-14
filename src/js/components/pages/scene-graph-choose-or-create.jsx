'use strict';
var React = require('react');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneGraphList = require('../scene-graph-list.jsx');
var FormHelper = require('../../mixins/form-helper');

var SceneGraphChooser = React.createClass({

    mixins: [Authentication, FormHelper],

    handleSubmit: function(event) {
        event.preventDefault();
        HubSendActions.tryCreateSceneGraph(this.getRefVal('name'));
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
                            <div className='form-group'>
                                <input type='text' ref='name' className='form-control' placeholder='name' />
                            </div>
                            <button type='submit' className='btn btn-default'>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = SceneGraphChooser;

