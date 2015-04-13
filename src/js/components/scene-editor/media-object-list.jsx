'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');

var MediaObjectList = React.createClass({
    getInitialState: function() {
        return {
            selectedIndex: null,
            listLayout: 'grid' 
        };
    },

    handleSelect: function(index) {
        return function(e) {
            this.props.focusHandler(index);
            this.setState({selectedIndex: index});
        }.bind(this);
    },

    handleDelete: function (scene, index) {
        return function (e) {
            SceneActions.removeMediaObject(scene, index);
        }.bind(this);
    },

    handleListChange: function(event) {
        this.setState({listLayout: event.target.textContent});
    },

    listSelectedClass: function(value) {
        if (this.state.listLayout === value) {
            return 'btn btn-primary';
        } else {
            return 'btn btn-default';
        }
    },

    render: function() {
        var items = null;
        
        if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {
            items = this.props.scene.scene.map(function(mediaObject, index) {
                
                var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');
                return (
                    <li className={klass}
                     key={index}
                     onClick={this.handleSelect(index)} 
                     >
                        <MediaObjectPreview mediaObject={mediaObject}>
                            <button className='btn' onClick={this.handleDelete(this.props.scene, index)}>
                                <Glyphicon icon='remove-circle' />
                            </button>
                        </MediaObjectPreview>
                        
                    </li>
                );
            }.bind(this));  
        } else {
            items = [<li key='empty' className='empty-media-object-item '>Nothing in the scene yet</li>];
        }

        var wrapperClass = 'media-object-list media-object-list-' + this.state.listLayout;

        return (
            <div className={wrapperClass}>
                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("grid")}>grid</button>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("list")}>list</button>
                </div>
                <p className='media-object-list-instructions'>Drag and drop images here to add to scene</p>
                <ul className=''>{items}</ul>
            </div>
        );
    }

});

module.exports = MediaObjectList;