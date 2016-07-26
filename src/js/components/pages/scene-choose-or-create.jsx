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
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/57967f9081a29c700e9dc4bf">Demo 1 Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/57967a1181a29c700e9dc455">Demo 2a Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/5797082a81a29c700e9dd59e">Demo 2b Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/579710b481a29c700e9ddaae">Demo 2c Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/5790a7e92e00bd003d640b91">Demo 3a Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/57973a1981a29c700e9de55d">Demo 3b Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/57967d3181a29c700e9dc482">Demo 4 Example</a>
                                </li>
								<li>
                                    <a href="http://uos-sceneeditor.azurewebsites.net/#/scenes/5796838081a29c700e9dc5be">Demo 5 Example</a>
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
