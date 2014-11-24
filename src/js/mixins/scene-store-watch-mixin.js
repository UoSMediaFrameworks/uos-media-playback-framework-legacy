var React = require('react');
var SceneStore = require('../stores/scene-store');

var SceneStoreWatchMixin = function(cb) {
    return {
        getInitialState:function(){
            return cb();
        },
        componentWillMount:function(){
            SceneStore.addChangeListener(this._onChange);
        },
        componentWillUnmount: function() {
            SceneStore.removeChangeListener(this._onChange);
        },
        _onChange:function(){
            this.setState(cb());
        },
    };
};

module.exports = SceneStoreWatchMixin;