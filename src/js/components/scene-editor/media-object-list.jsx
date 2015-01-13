'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');

var MediaObjectList = React.createClass({
    getInitialState: function() {
        return {
            selectedIndex: null 
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

    render: function() {
        var items = null;
        
        if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {
            items = this.props.scene.scene.map(function(mediaObject, index) {
                var style = {
                    backgroundImage: 'url(\'' + mediaObject.url + '\')' 
                };
                var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');
                return (
                    <li className={klass}
                     key={index}
                     onClick={this.handleSelect(index)} 
                     >
                        <div className='media-object-item-preview' style={style}>
                            <button className='btn' onClick={this.handleDelete(this.props.scene, index)}>
                                <Glyphicon icon='remove-circle' />
                            </button>
                        </div>
                    </li>
                );
            }.bind(this));  
        } else {
            items = [<li key='empty' className='empty-media-object-item '>Nothing in the scene yet</li>];
        }

        return (
            <ul className='media-object-list fill-height'>{items}</ul>
        );
    }

});

module.exports = MediaObjectList;