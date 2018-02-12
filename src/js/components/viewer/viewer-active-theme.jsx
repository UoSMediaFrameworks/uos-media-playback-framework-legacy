'use strict';

var React = require('react');
var _ = require('lodash');


var ActiveTheme = React.createClass({

    getInitialState: function () {
        return {};
    },

    componentWillUpdate: function () {
        if (this.props.shouldHide) {
            this.refs["theme-name"].style.display = "none"
        } else {
            this.refs["theme-name"].style.display = "block"
        }
    },

    getThemeFromQuery: function () {
        if(this.props.scene && this.props.themeQuery) {
            var foundTheme = "";
            _.forEach(Object.keys(this.props.scene.themes), function(theme) {
               if(this.props.scene.themes[theme] === this.props.themeQuery) {
                   foundTheme = theme;
                   return false;
               }
            }.bind(this));
            return foundTheme;
        }

        return "";
    },

    render: function () {
        var theme = this.getThemeFromQuery();
        return (
            <div className='theme-viewer info-box' ref="theme-name" id="theme-name">
                {theme}
            </div>
        );
    }

});

module.exports = ActiveTheme;
