'use strict';

var React = require('react');

var Dropzone = React.createClass({
    getInitialState: function() {
        return {
            isDragActive: false
        };
    },

    handleDragLeave: function(e) {
        this.setState({
            isDragActive: false
        });
    },

    handleDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
            isDragActive: true
        });
    },

    handleDrop: function(e) {
        e.preventDefault();

        this.setState({
            isDragActive: false
        });

        if (this.props.handler) {
            var files = e.dataTransfer && e.dataTransfer.files;
            this.props.handler(files);
        } else {
            console.error('No handler specified to accept the dropped file.');
        }
    },
    render: function() {
        var klass = 'dropzone ' + this.props.className;
        return (
            <div className={klass}
             onDragLeave={this.handleDragLeave} 
             onDragOver={this.handleDragOver} 
             onDrop={this.handleDrop}>
                {this.props.children}
            </div>
        );
    }

});

module.exports = Dropzone;