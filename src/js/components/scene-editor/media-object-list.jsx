'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');
var TagMatcher = require('../../utils/tag-matcher');
var _ = require("lodash");
var MediaObjectList = React.createClass({
    getInitialState: function () {
        return {
            selectedIndex: this.props.focusedMediaObject,
            listLayout: 'Grid',
            tagSearch: "",
            highlightType: 'Filter'
        };
    },

    handleSelect: function (index) {
        return function (e) {
            e.preventDefault();
            this.props.focusHandler(index);
            this.setState({selectedIndex: index});
        }.bind(this);
    },

    handleDelete: function (scene, index) {
        return function (e) {
            // APEP stop the event propagating to its parent (handleSelect) - this would fire the old index again
            e.stopPropagation();
            // APEP using default browser implementation, force the user to accept or decline action
            if (confirm('Are you sure you wish to remove this media object from the scene?')) {
                SceneActions.removeMediaObject(scene, index);

                // APEP now we've removed a media object, we need to clear the focused element.
                this.props.focusHandler(null);
            }

        }.bind(this);
    },

    handleListChange: function (event) {
        this.setState({listLayout: event.target.textContent});
    },

    handleSearchChange: function (event) {
        this.setState({tagSearch: event.target.value});
    },

    handleHighlightChange: function (event) {
        this.setState({highlightType: event.target.textContent})
    },

    handleHighlightType: function () {
        if (this.state.highlightType === 'Highlight') {
            return 'highlighted-media-object';
        } else {
            return 'display-none'
        }
    },

    highlightSelectedClass: function (value) {
        if (this.state.highlightType === value) {
            return 'btn btn-primary';
        } else {
            return 'btn btn-default';
        }
    },

    listSelectedClass: function (value) {
        if (this.state.listLayout === value) {
            return 'btn btn-primary';
        } else {
            return 'btn btn-default';
        }
    },

    /* shouldComponentUpdate: function(nextProps, nextState) {
     //Only allow component update if we have a change in focused media or scene media list length
     return this.state.selectedIndex === null ||  ( this.state.selectedIndex !== nextProps.focusedMediaObject || this.props.scene.scene.length !== nextProps.scene.scene.length );
     },*/
    componentWillUnmount: function () {
        console.log("media-object-list unmounting")
    },
    componentWillUpdate: function (nextProps, nextState) {
        //Only update selectedIndex state if changed
        if (this.props.focusedMediaObject !== nextProps.focusedMediaObject)
            this.setState({selectedIndex: nextProps.focusedMediaObject});
    },

    render: function () {
        var items = null;
        var self =this;
        var mediaArray = null;
        try {
            if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {

                //AP: attaching tag matcher to the media objects array and plugging in the tagSearch value.
                var match = _(self.props.scene.scene)
                    .filter(function(mo) {
                        return  new TagMatcher("(" + self.state.tagSearch + ")").match(mo.tags);
                    })
                    .value();
                items = this.props.scene.scene.map(function (mediaObject, index) {

                    var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');

                    if (this.state.tagSearch.length > 0) {

                        if (mediaObject.tags.indexOf(self.state.tagSearch) !== -1) {
                            //Highlights media objects that match the tag search.
                            if (self.state.highlightType === "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        } else {
                            if (self.state.highlightType !== "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        }
                        _.each(match,function(mo){
                            if(_.isEqual(mo, mediaObject)){
                                //AP : making sure that the objects that answer to the tag matcher are highlighted
                                if (self.state.highlightType === "Highlight"){
                                    klass += ' ' + self.handleHighlightType();
                                }else if( self.state.highlightType === "Filter"){

                                    klass = "media-object-item" + (self.state.selectedIndex === index ? ' selected' : '');
                                }

                            }
                        });


                    }

                    return (
                        <li className={klass}
                            key={index}
                            onClick={this.handleSelect(index)}>
                            <MediaObjectPreview mediaObject={mediaObject}>
                                <button className='btn' onClick={this.handleDelete(this.props.scene, index)}>
                                    <Glyphicon icon='remove-circle'/>
                                </button>
                            </MediaObjectPreview>
                        </li>
                    );
                }.bind(this));
            } else {
                items = [<li key='empty' className='empty-media-object-item '>Nothing in the scene yet</li>];
            }

        } catch (e) {
            console.log(e)
        }

        var wrapperClass = 'media-object-list media-object-list-' + this.state.listLayout;

        return (
            <div style={{overflowY: "none", height: 'calc(100% - 10px)'}}>
                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("Grid")}>
                        Grid
                    </button>
                    <button type='button' onClick={this.handleListChange} className={this.listSelectedClass("List")}>
                        List
                    </button>
                </div>

                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' onClick={this.handleHighlightChange}
                            className={this.highlightSelectedClass("Highlights")}>Highlight
                    </button>
                    <button type='button' onClick={this.handleHighlightChange}
                            className={this.highlightSelectedClass("Filter")}>Filter
                    </button>
                </div>

                <form >
                    <input ref="tag-search"
                           className='form-control'
                           value={this.state.tagSearch}
                           onChange={this.handleSearchChange}
                           placeholder="Search for media by tag"/>
                </form>

                <div className={wrapperClass}>
                <   ul className=''>{items}</ul>
                </div>
            </div>
        );
    }

});

module.exports = MediaObjectList;
