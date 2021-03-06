'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./preview/media-object-preview.jsx');
var TagMatcher = require('../../utils/tag-matcher');
var _ = require("lodash");
var MediaDownloader = require('../../utils/media-downloader.js');
var soundCloud = require('../../utils/sound-cloud');
var ThemeDownloader = require('../../utils/theme-downloader');
var toastr = require("toastr"); 


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

    downloadMediaObjects: function(items) {
        var urls = [];
        
        var dlmesg = toastr.info("This may take a long time","Downloading Content", {timeOut:0, extendedTimeOut: 0, positionClass: "toast-bottom-right"});
        items.forEach(listItem => {
            if (listItem.props.isMatched) {
            var mediaObject = listItem.props.mediaObject;
                if(mediaObject.hasOwnProperty("url")) { //required to avoid none file items (text)
                    if(mediaObject.url.startsWith("https://soundcloud") || mediaObject.url.startsWith("http://soundcloud")) {
                    soundCloud.streamUrl(mediaObject.url, function(err, streamUrl) {
                         if (!err) {
                             urls.push(streamUrl);
                         }
                        })
                    } else {
                        urls.push(mediaObject.url);
                    }
                }
            }
        });

        var searchTerm = ""
        if (this.state.tagSearch.length > 0) {
            searchTerm = "_(" + this.state.tagSearch + ")"
        }
        
        var progress = 0;
        var progressCB = function() {
            progress +=1
            dlmesg.find(".toast-message").text("Processing item " + progress + "  of " + urls.length );
            if (progress > urls.length) {
                dlmesg.find(".toast-message").text("Ziping files for download");
            } 
        }
        var errorCB = function () {
            dlmesg.fadeOut(0); //instant remove
            toastr.error("Download failed");
        }
        var completeCB = function() {
            dlmesg.fadeOut(0);
            toastr.success("Download Done");
        }
        

        var filename = this.props.scene._id + "_" + this.props.scene.name + searchTerm + ".zip";
        MediaDownloader.downloadAsZipFile(urls, filename, progressCB, errorCB, completeCB);
    },

    downloadThemes: function() {
        var downloader = new ThemeDownloader();
        var dlmesg = toastr.info("This may take a long time","Downloading Content", {timeOut:0, extendedTimeOut: 0, positionClass: "toast-bottom-right"});

        var progress = 0;
        var progressCB = function(outOf) {
            progress +=1
            dlmesg.find(".toast-message").text("Processing item " + progress + "  of " + outOf );
            if (progress > outOf) {
                dlmesg.find(".toast-message").text("Ziping files for download");
            } 
        }
        var errorCB = function () {
            dlmesg.fadeOut(0); //instant remove
            toastr.error("Download failed");
        }
        var completeCB = function() {
            dlmesg.fadeOut(0);
            toastr.success("Download Done");
        }

        downloader.download(this.props.scene, progressCB, errorCB, completeCB );
    },

    getFilteredMediaList() {
        try {
            if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {

                let tagMatcher = new TagMatcher("(" + this.state.tagSearch + ")");

                var items = this.props.scene.scene.map(function (mediaObject, index) {

                    var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');

                    //if (this.state.tagSearch.length > 0) {
                        let isMatchedByTagMatcher = tagMatcher.match(mediaObject.tags);
                        let isPartialMatch = mediaObject.tags.indexOf(this.state.tagSearch) !== -1;
                        let isMatched = (isMatchedByTagMatcher || isPartialMatch);

                        //AP : making sure that the objects that answer to the tag matcher are highlighted
                        if (isMatched) {
                            // APEP if its a match and we are highlighting apply the class, if its filter the unmatched will have style applied
                            if (this.state.highlightType === "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        } else {
                            // APEP if it is not a match, and we are on type filter, we should append the class
                            if (this.state.highlightType !== "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        }
                    //}

                    return (
                        <li className={klass}
                            key={index}
                            mediaObject={mediaObject}
                            isMatched ={isMatched}
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
            return items;

        } catch (e) {
            console.log(e)
            return [];
        }
    },

    render: function () {
        var items = this.getFilteredMediaList();

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

                <div className='btn-group btn-group-xs' role='group' style ={{float: "right"}} >
                <button type='button'
                        className="btn btn-dark"
                        onClick={() => {this.downloadMediaObjects(items)}}>
                        Download Media
                </button>

                <button type='button'
                        className="btn btn-dark"
                        onClick={() => {
                            this.downloadThemes();
                        }}>
                        Download Audio Themes
                </button>

                </div>

                <form >
                    <input ref="tag-search"
                           className='form-control'
                           value={this.state.tagSearch}
                           onChange={this.handleSearchChange}
                           placeholder="Search by tag statements"/>
                </form>

                <div className={wrapperClass}>
                <   ul className=''>{items}</ul>
                </div>
            </div>
        );
    }

});

module.exports = MediaObjectList;
