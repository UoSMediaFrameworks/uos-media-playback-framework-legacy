'use strict';

var React = require('react');

var MediaObjectList = React.createClass({
    handleClick: function(index) {
        return function(e) {
            this.props.focusHandler(index);
        }.bind(this);
    },

    render: function() {
        var items = null;
        
        if (this.props.scene.scene && this.props.scene.scene.length !== 0) {
            items = this.props.scene.scene.map(function(mediaObject, index) {
                var style = {
                    backgroundImage: 'url(' + mediaObject.url + ')' 
                };
                return (
                    <li className='media-object-item' 
                     key={index}
                     onClick={this.handleClick(index)} 
                     style={style}>
                    </li>
                );
            }.bind(this));  
        } else {
            items = [<li key='empty'>Nothing in the scene yet</li>];
        }

        return (
            <ul className='media-object-list fill-height'>{items}</ul>
        );
    }

});

module.exports = MediaObjectList;