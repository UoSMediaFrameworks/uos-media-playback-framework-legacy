'use strict';

var React = require('react');
var _ = require('lodash');

var TagUnion = React.createClass({

    render: function() {
        var items = [];
        if (this.props.scene && this.props.scene.scene) {
            var union = _.union.apply(null, this.props.scene.scene.map(function (mo) {
                return _.map(mo.tags.split(','), function(str) { return str.trim(); });
            }));    

            union = _.filter(union, function(val) { return val !== '';}).sort();
            
            items = _.map(union, function(tag, index, list) {
                var text = tag + ((index + 1 === list.length) ? '' : ', ');
                return <li key={tag}>{text}</li>;
            });
        }
        

        return (
            <ul className='tag-union'>{items}</ul>
        );
    }

});

module.exports = TagUnion;