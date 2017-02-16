'use strict';

var React = require('react');
var _ = require('lodash');


var ActiveTheme = React.createClass({

    getInitialState: function() {
        return {
        };
    },
    componentWillUpdate:function(){
        if(this.props.shouldHide){
            this.refs["theme-name"].style.display ="none"
        }else{
            this.refs["theme-name"].style.display ="block"
        }
    },

    render: function() {
        var theme = this.props.themeQuery || "";
        return (
            <div className='theme-viewer info-box' ref="theme-name" id="theme-name">
                {theme}
            </div>
        );
    }

});

module.exports = ActiveTheme;
