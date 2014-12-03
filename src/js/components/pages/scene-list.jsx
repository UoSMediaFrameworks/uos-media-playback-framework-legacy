'use strict';
var React = require('react');
var Authentication = require('../../mixins/Authentication');
var HubSendActions = require('../../actions/hub-send-actions');
var SceneListStore = require('../../stores/scene-list-store');
var FormHelper = require('../../mixins/form-helper');
var Router = require('react-router');
var Link = require('react-router').Link;

function _getState () {
    return {scenes: SceneListStore.getAll()};
}

var _blank = 'BLANK';

var SceneList = React.createClass({

    mixins: [Authentication, FormHelper, Router.Navigation],
    
    getInitialState: function() {
        return _getState();
    },
    
    componentDidMount: function() {
        SceneListStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
        SceneListStore.removeChangeListener(this._onChange);
    },
    
    _onChange: function() {
        this.setState(_getState());
    },

    handleSubmit: function(event) {
        event.preventDefault();
        HubSendActions.tryCreateScene(this.getRefVal('name'));
    },
    
    render: function() {
        
        var links = this.state.scenes.map(function(scene) {
            return (
                <li key={scene._id}>
                    <Link to='scene' params={{id: scene._id}}>{scene.name}</Link>
                </li>
            );
        });

        return (
            <div className='row'>
                <div className='col-md-6'>
                    <h2>Edit an Existing Scene</h2>
                    <ul>
                        {links}
                    </ul>
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
            
        );
            
        

        
    }

});

module.exports = SceneList;