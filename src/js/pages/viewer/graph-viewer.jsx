'use strict';

var React = require('react');
var async = require('async');
var _ = require('lodash');

var MediaEngineStore = require('../../stores/media-engine-store');

var GraphViewer = React.createClass({

    getInitialState: function() {
        return this.getStateFromStores();
    },

    getStateFromStores: function() {
        return {
            media: MediaEngineStore.getMedia()
        }
    },

    _onChange: function() {
        console.log("GraphView[MEDIA ENGINE RENDERER] - got an update event from a Store")

        console.log(this.getStateFromStores());

        this.setState(this.getStateFromStores());
    },

    componentDidMount: function() {
        MediaEngineStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        MediaEngineStore.removeChangeListener(this._onChange);
    },

    render: function() {
        return (
            <div>
                {_.map(this.state.media, (mo) => {
                    return <p key={mo._id}>{mo._id}</p>
                })}
            </div>
        )
    }
});

module.exports = GraphViewer;

