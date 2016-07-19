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
                        <div>
                            <h4> Example Scenes </h4>
                            <ul>
                                <li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/578dfadc389260641874b2c1">MF Audio Example</a>
                                </li>
                                <li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/578dfb1e389260641874b2de">MF Minimal Vimeo Example</a>
                                </li>
                                <li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/578dfb83389260641874b2e3">MF Vimeo Example</a>
                                </li>
                                <li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/578d54eaef8cf0101bc4211f">MF Solo Example</a>
                                </li>
                            </ul>
                        </div>
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
