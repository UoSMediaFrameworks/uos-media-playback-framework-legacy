'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');
var TagMatcher = require('../../utils/tag-matcher');
var _ = require("lodash");

const DASH_CACHE = "dash-blob-cache";

// async function addToCache(urls) {
//
//     urls = _.filter(urls, url => {
//         return url.indexOf("video/raw") !== -1;
//     });
//
//     urls = _.map(urls, url => {
//         return url.replace("video/raw", "video/transcoded/dash")
//     });
//
//
//     let allTranscodedUrls = [];
//
//     _.forEach(urls, url => {
//
//         url = url.replace("https://", "");
//
//         let urlWithNoFileName = url.split("/")
//
//
//         urlWithNoFileName = urlWithNoFileName.slice(0, urlWithNoFileName.length - 1);
//
//
//         urlWithNoFileName = urlWithNoFileName.join("/");
//
//
//         let audio =  "https://" + urlWithNoFileName + "/audio_128k.mp4";
//         let video1 = "https://" + urlWithNoFileName + "/video_600k.mp4";
//         let video2 = "https://" + urlWithNoFileName + "/video_1200k.mp4";
//         let video3 = "https://" + urlWithNoFileName + "/video_2400k.mp4";
//         let video4 = "https://" + urlWithNoFileName + "/video_4800k.mp4";
//
//         allTranscodedUrls.push(audio, video1, video2, video3, video4)
//     });
//
//     console.log(allTranscodedUrls);
//
//     const myCache = await window.caches.open(DASH_CACHE);
//     await myCache.addAll(allTranscodedUrls);
// }

// async function addSceneMediaToCache(scene) {
//     let mos = scene.scene;
//
//     let urlMos = _.filter(mos, mo => {
//         return mo.hasOwnProperty("url");
//     })
//
//     let urls = _.map(urlMos, mo => {
//         return mo.url
//     });
//
//     addToCache(urls);
// }


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

    componentDidMount: function() {
        // addSceneMediaToCache(this.props.scene)
    },

    componentWillUpdate: function (nextProps, nextState) {
        //Only update selectedIndex state if changed
        if (this.props.focusedMediaObject !== nextProps.focusedMediaObject)
            this.setState({selectedIndex: nextProps.focusedMediaObject});

        if (!_.isEqual(this.props.scene, nextProps.scene)) {
            // addSceneMediaToCache(this.props.scene)
        }
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

                        //AP : making sure that the objects that answer to the tag matcher are highlighted
                        if (isMatchedByTagMatcher) {
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
