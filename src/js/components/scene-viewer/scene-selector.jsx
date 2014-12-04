'use strict';

var React = require('react');
var Authentication = require('../../mixins/Authentication');
var SceneList = require('../scene-list.jsx');

var SceneSelector = React.createClass({
    mixins: [Authentication],
    render: function() {
        return (
            <div>
                <h2>Choose a scene</h2>
                <SceneList />
            </div>
        );
    }

});

module.exports = SceneSelector;