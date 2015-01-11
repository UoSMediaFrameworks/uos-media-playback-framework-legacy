'use strict';
var React = require('react');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneList = require('../scene-list.jsx');
var FormHelper = require('../../mixins/form-helper');

var SceneChooser = React.createClass({

    mixins: [Authentication, FormHelper],

    handleSubmit: function(event) {
        event.preventDefault();
        HubSendActions.tryCreateScene(this.getRefVal('name'));
    },
    
    render: function() {
        return (
            <div className='container'>
                <div className='row'>
                    <div className='col-md-6'>
                        <h2>Edit an Existing Scene</h2>
                        <SceneList />
                        
                    </div>
                    <div className='col-md-6'>
                        <h2>Create a new Scene</h2>
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

module.exports = SceneChooser;