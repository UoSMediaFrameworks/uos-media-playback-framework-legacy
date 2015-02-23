'use strict';

var React = require('react');
var _ = require('lodash');

function splitTrim(str) {
    return _.map(str.split(','), function(s) { return s.trim(); });
}

var TagUnion = React.createClass({
    propTypes: {
        focusedMediaObject: React.PropTypes.number,
        scene: React.PropTypes.object
    },

    render: function() {
        var items = [],
            mediaScene = this.props.scene,
            selectedIndex = this.props.focusedMediaObject;
        if (mediaScene && mediaScene.scene) {
            // get tags to highlight
            var selectedTags = [];
            if (selectedIndex !== undefined && selectedIndex !== null) {
                var mediaObject = mediaScene.scene[selectedIndex];
                if (mediaObject) {
                    selectedTags = splitTrim(mediaObject.tags); 
                }
                
            } 

            var union = _.union.apply(null, mediaScene.scene.map(function (mo) {
                return splitTrim(mo.tags);
            }));    

            union = _.filter(union, function(val) { return val !== '';}).sort();
            
            items = _.map(union, function(tag, index, list) {
                var klass = selectedTags.indexOf(tag) !== -1 ? 'highlight' : '';
                var text = tag + ((index + 1 === list.length) ? '' : ', ');
                return <li className={klass} key={tag}>{text}</li>;
            });
        }
        

        return (
            <ul className='tag-union'>{items}</ul>
        );
    }

});

module.exports = TagUnion;