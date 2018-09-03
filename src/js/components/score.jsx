'use strict';

var React = require('react');
var _ = require('lodash');

var ScoreTextEditor = require('./score/score-text-editor.jsx');

var Score = React.createClass({
    render: function() {
        return (
            <div className="col-lg-12 score-page">
                <h2>SCORE DEVELOPMENT</h2>
                <ScoreTextEditor/>
            </div>
        )
    }
});

module.exports = Score;
