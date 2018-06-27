'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');
var TagMatcher = require('../../utils/tag-matcher');
var _ = require("lodash");
var JSZip = require("JSzip")

var zip = new JSZip();

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

    addUrlToZip: function(url) {
        return new Promise(function(resolve) {
          var httpRequest = new XMLHttpRequest();
          httpRequest.open("GET", url);
          httpRequest.onload = function() {
              var simpleFileName = url.split('/').pop().split('#')[0].split('?')[0]; //filename from URL
              var guid = url.split('/')[url.split('/').length-2] //guid location in mf asset store.
            zip.file(guid + "_" + simpleFileName, this.responseText);
            resolve()
          }
          httpRequest.send()
        })
    },

    downloadAsZipFile: function(urls) {
        var self = this;
        //promise structure to zip all files and download.
        Promise.all(urls.map(function(url) {
            return self.addUrlToZip(url)
          }))
          .then(function() {
            console.log(zip);
            zip.generateAsync({
                type: "blob",
            })
            .then(function(content) {
                var filename = self.props.scene._id + "_" + self.props.scene.name + ".zip";
                self.downloadBlobWithFileName(content, filename);
            });
          })
      },

    downloadBlobWithFileName(blob, filename) {
        let blobURL = URL.createObjectURL(blob)

        //workaround to rename blob!
        let a = document.createElement("a") 
        a.download = filename
        a.href = blobURL
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    },

    render: function () {
        var items = null;
        var self =this;
        try {
            if (this.props.scene && this.props.scene.scene && this.props.scene.scene.length !== 0) {

                let tagMatcher = new TagMatcher("(" + self.state.tagSearch + ")");

                items = this.props.scene.scene.map(function (mediaObject, index) {

                    var klass = 'media-object-item' + (this.state.selectedIndex === index ? ' selected' : '');

                    if (this.state.tagSearch.length > 0) {

                        let isMatchedByTagMatcher = tagMatcher.match(mediaObject.tags);

                        let isPartialMatch = mediaObject.tags.indexOf(self.state.tagSearch) !== -1;

                        //AP : making sure that the objects that answer to the tag matcher are highlighted
                        if (isMatchedByTagMatcher || isPartialMatch) {
                            // APEP if its a match and we are highlighting apply the class, if its filter the unmatched will have style applied
                            if (self.state.highlightType === "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        } else {
                            // APEP if it is not a match, and we are on type filter, we should append the class
                            if (self.state.highlightType !== "Highlight")
                                klass += ' ' + this.handleHighlightType();
                        }
                    }

                    return (
                        <li className={klass}
                            key={index}
                            mediaObject={mediaObject}
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

                <button className='btn-dark' style ={{float: "right"}}type='button' onClick={() => {
                        var urls = [];
                        items.forEach(listItem => {
                            urls.push(listItem.props.mediaObject.url);
                        });
                        this.downloadAsZipFile(urls)
                    }}>
                        Download All   
                </button>
                <button className='btn-dark' style ={{float: "right"}}type='button' onClick={() => {
                        var urls = [];
                        items.forEach(listItem => {
                            urls.push(listItem.props.mediaObject.url);
                        });
                        this.downloadAsZipFile(urls)
                    }}>
                        Download by theme   
                </button>

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
