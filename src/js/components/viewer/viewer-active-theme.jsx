'use strict';

var React = require('react');
var _ = require('lodash');


var ActiveTheme = React.createClass({

    getInitialState: function() {
        return {
        };
    },

    render: function() {
        var theme = this.props.themeQuery || "";
        return (
            <div className='theme-viewer info-box' id="theme-name">
                {theme}
            </div>
        );
    }

});

module.exports = ActiveTheme;
