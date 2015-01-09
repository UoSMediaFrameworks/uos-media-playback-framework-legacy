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
                    <li className='col-lg-2 col-md-2 col-sm-3 col-xs-4 media-object-column' 
                     key={index}>
                        <div onClick={this.handleClick(index)} 
                             className='media-object-preview' 
                             style={style}></div>
                    </li>
                );
            }.bind(this));  
        } else {
            items = [<li key='empty'>Nothing in the scene yet</li>];
        }

        return (
            <ul className='row media-object-list'>{items}</ul>
        );
    }

});

module.exports = MediaObjectList;