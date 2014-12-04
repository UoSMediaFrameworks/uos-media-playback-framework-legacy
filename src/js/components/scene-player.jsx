'use strict';

var React = require('react');
var Authentication = require('../mixins/Authentication');

var Player = React.createClass({

    mixins: [Authentication],
	
    render: function() {
        var json = JSON.stringify(this.props.scene);
        return (
            <div id="player">
                <pre>{json}</pre>
            </div>
        );
    }

});

module.exports = Player;