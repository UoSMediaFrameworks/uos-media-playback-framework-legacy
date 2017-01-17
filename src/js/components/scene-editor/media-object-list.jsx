'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');

var MediaObjectList = React.createClass({
    getInitialState: function() {
        return {
            selectedIndex: this.props.focusedMediaObject,
            listLayout: 'grid',
            tagSearch: "",
            highlightType: 'border'
        };
    },

    handleSelect: function(index) {
        return function(e) {
            e.preventDefault();
            this.props.focusHandler(index);
            this.setState({selectedIndex: index});
        }.bind(this);
    },

    handleDelete: function (scene, index) {
        return function (e) {
            e.preventDefault();
            SceneActions.removeMediaObject(scene, index);
        }.bind(this);
    },

    handleListChange: function(event) {
        this.setState({listLayout: event.target.textContent});
    },

    handleSearchChange: function(event) {
        this.setState({tagSearch: event.target.value});
    },

    handleHighlightChange: function(event) {
        this.setState({highlightType: event.target.textContent})
    },

    handleHighlightType: function() {
        if(this.state.highlightType === 'border') {
            return 'highlighted-media-object';
        } else {
            return 'display-none'
        }
    },

    highlightSelectedClass: function(value) {
        if (this.state.highlightType === value) {
            return 'btn btn-primary';
        } else {
            return 'btn btn-default';
        }
    },

    listSelectedClass: function(value) {
        if (this.state.listLayout === value) {
            return 'btn btn-primary';
        } else {
            return 'btn btn-default';
        }
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        //Only allow component update if we have a change in focused media or scene media list length
        return this.state.selectedIndex === null ||  ( this.state.selectedIndex !== nextProps.focusedMediaObject || this.props.scene.scene.length !== nextProps.scene.scene.length );
    },
    componentWillUnmount: function () {
      console.log("media-object-list unmounting")
    },
    componentWillUpdate: function(nextProps, nextState) {
        //Only update selectedIndex state if changed
        if(this.props.focusedMediaObject !== nextProps.focusedMediaObject)
            this.setState({selectedIndex: nextProps.focusedMediaObject});
    },

    render: function() {
        var items = null;

        if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {
            items = this.props.scene.scene.map(function(mediaObject, index) {

                var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');

                if(this.state.tagSearch.length > 0) {
                    if(mediaObject.tags.indexOf(this.state.tagSearch) != -1) {
                        //Highlights media objects that match the tag search.
                        if(this.state.highlightType === "border")
                            klass += ' ' + this.handleHighlightType();
                    } else {
                        if(this.state.highlightType !== "border")
                            klass += ' ' + this.handleHighlightType();
                    }
                }

                return (
                    <li className={klass}
                     key={index}
                     onClick={this.handleSelect(index)}
                     >
                        <MediaObjectPreview mediaObject={mediaObject}>
                            <button className='btn' onClick={this.handleDelete(this.props.scene, index)}>
                                <Glyphicon icon='remove-circle' />
                            </button>
                        </MediaObjectPreview>

                    </li>
                );
            }.bind(this));
        } else {
            items = [<li key='empty' className='empty-media-object-item '>Nothing in the scene yet</li>];
        }

        var wrapperClass = 'media-object-list media-object-list-' + this.state.listLayout;

        return (
            <div className={wrapperClass}>
                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("grid")}>grid</button>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("list")}>list</button>
                </div>

                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' onClick={this.handleHighlightChange} className={this.highlightSelectedClass("border")}>border</button>
                    <button type='button' onClick={this.handleHighlightChange} className={this.highlightSelectedClass("hidden")}>hidden</button>
                </div>

                <div className={this.props.saveFlagKlass}> Saved Status </div>

                <form >
                    <input ref="tag-search"
                           className='form-control'
                           value={this.state.tagSearch}
                           onChange={this.handleSearchChange}
                           placeholder="Search for media by tag"/>
                </form>

                <ul className=''>{items}</ul>
            </div>
        );
    }

});

module.exports = MediaObjectList;
