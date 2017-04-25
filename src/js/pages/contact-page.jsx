'use strict';

var React = require('react');
var FormHelper = require('../mixins/form-helper');
var HubSendActions = require('../actions/hub-send-actions');


var ContactPage = React.createClass({

    mixins: [FormHelper],
    getInitialState: function () {
        return {
            errorMessage: null
        }
    },
    handleSubmit: function () {
        var  formData = {
            name: this.getRefVal('name'),
            email: this.getRefVal('email'),
            subject:this.getRefVal('subject'),
            description:this.getRefVal('description')
        };
        e.preventDefault();
        HubSendActions.saveContactPageFeedback(formData)
    },
    render: function () {
        return (

            /*TODO: Angel P. Form validation would be needed for the email and subject inputs
             react-form-validate has been tested unsuccessfully,
             \uos-media-playback-framework-legacy\node_modules\react-form-validate\index.js:1
             import vForm from './source/ValidateableForm.react.jsx';
             ^
             ParseError: 'import' and 'export' may appear only with 'sourceType: module'

             */
                <div>
                    <div className="row">
                        <div className="col-sm-6 col-sm-offset-3">
                            <h1>Contact us</h1>
                            <form  ref="vForm" role="form">
                                <div className='form-group'>
                                    <label>Name</label>
                                    <input ref="name" name="name" type="text" className="form-control"
                                          />
                                </div>
                                <div className='form-group'>
                                    <label>Email</label>
                                    <input  ref="email"  name="email" type="text" className="form-control"
                                           />
                                </div>
                                <div className='form-group'>
                                    <label>Subject</label>
                                    <input ref="subject" name="subject" type="text" className="form-control"
                                         />
                                </div>
                                <div className='form-group'>
                                    <label>Description</label>
                                    <textarea ref="description" name="description" className="form-control"
                                           placeholder="Description your question or problem"/>
                                </div>

                                <div className='form-group'>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>

                            </form>

                        </div>
                    </div>
                </div>

        )
    }

});

module.exports = ContactPage;
