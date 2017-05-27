'use strict';

var React = require('react');

var TagSelector = React.createClass({

    getInitialState: function() {
        return {
        };
    },

    render: function() {
        return (
            <form className='tag-filter' ref="tag_form" onSubmit={this.props.updateTags}>
                <input ref='tags' onBlur={this.props.handleBlur} type='text' placeholder='tag, tag, ...'
                       className='form-control scene-listener-tag-input'/>
            </form>
        )
    }

});

module.exports = TagSelector;
