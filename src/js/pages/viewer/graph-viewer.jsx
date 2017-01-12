'use strict';

var React = require('react');

var GraphViewer = React.createClass({

    

    render: function() {
        return (
            <div>
                <h2>Graph Viewer</h2>
                <p>{this.props.location.query.room}</p>
            </div>
        );
    }
});

module.exports = GraphViewer;
