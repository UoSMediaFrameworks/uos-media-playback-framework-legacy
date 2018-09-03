'use strict';

var React = require('react');
var Glyphicon = require('../glyphicon.jsx');
var SceneActions = require('../../actions/scene-actions');
var CacheActions = require('../../actions/media-engine/cache-actions');
var MediaObjectPreview = require('./media-object-preview.jsx');
var TagMatcher = require('../../utils/tag-matcher');
var _ = require("lodash");
var Promise = require('bluebird');
var MediaDownloader = require('../../utils/media-downloader.js');
var soundCloud = require('../../utils/sound-cloud');
var ThemeDownloader = require('../../utils/theme-downloader');


const DASH_CACHE = "dash-blob-cache";
const AUDIO_CACHE = "audio-blob-cache";

function addToCache(urls, name) {

    CacheActions.cacheMessage(`starting video cache ${name}`);

    urls = _.filter(urls, url => {
        return url.indexOf("video/raw") !== -1;
    });

    urls = _.map(urls, url => {
        return url.replace("video/raw", "video/transcoded/dash")
    });


    let allTranscodedUrls = [];

    _.forEach(urls, url => {

        let isHttps = url.indexOf("https://") !== -1;

        url = url.replace("https://", "");
        url = url.replace("http://", "");

        let urlWithNoFileName = url.split("/");


        urlWithNoFileName = urlWithNoFileName.slice(0, urlWithNoFileName.length - 1);


        urlWithNoFileName = urlWithNoFileName.join("/");

        let protocol = isHttps ? "https://" : "http://";

        let audio =  protocol + urlWithNoFileName + "/audio_128k.mp4";
        let video1 = protocol + urlWithNoFileName + "/video_600k.mp4";
        let video2 = protocol + urlWithNoFileName + "/video_1200k.mp4";
        let video3 = protocol + urlWithNoFileName + "/video_2400k.mp4";
        let video4 = protocol + urlWithNoFileName + "/video_4800k.mp4";

        allTranscodedUrls.push(audio, video1, video2, video3, video4)
    });

    return new Promise((resolve, reject) => {
        window.caches.open(DASH_CACHE)
            .then((myCache) => {
                let downloadChunks = _.chunk(allTranscodedUrls, 5);
                Promise.map(downloadChunks, (chunkOfUrls) => {
                    return new Promise((resolve, reject) => {
                        // APEP wrap the addAll in our own promise, we don't want to block the cacher on errors
                        // we might as well cache everything after and just inform user something was missing or error
                        myCache.addAll(chunkOfUrls)
                            .then(resolve)
                            .catch((err) => {
                                resolve();
                            });
                    });
                }, {concurrency: 2})
                    .then(resolve)
                    .catch(reject)
            })
            .catch(reject);
    });
}

function addAudioToCache(urls, name) {

    CacheActions.cacheMessage(`starting audio cache ${name}`);

    urls = _.filter(urls, url => {
        return url.indexOf("/audio/") !== -1;
    });

    return new Promise((resolve, reject) => {
        window.caches.open(AUDIO_CACHE)
            .then((myCache) => {
                let downloadChunks = _.chunk(urls, 5);
                Promise.map(downloadChunks, (chunkOfUrls) => {
                    return new Promise((resolve, reject) => {
                        // APEP wrap the addAll in our own promise, we don't want to block the cacher on errors
                        // we might as well cache everything after and just inform user something was missing or error
                        myCache.addAll(chunkOfUrls)
                            .then(resolve)
                            .catch((err) => {
                                resolve();
                            });
                    });
                }, {concurrency: 2})
                    .then(resolve)
                    .catch(reject)
            })
            .catch(reject);
    });
}

function addSceneMediaToCache(scene, forAudio, forVideo) {
    let mos = scene.scene;

    let urlMos = _.filter(mos, mo => {
        return mo.hasOwnProperty("url");
    });

    let urls = _.map(urlMos, mo => {
        return mo.url
    });

    if (forAudio)
        addAudioToCache(urls, _.get(scene, "name"))
            .then(()=> {
                CacheActions.cacheMessage(`finished audio cache ${_.get(scene, "name")}`);
            })
            .catch(() => {
                CacheActions.cacheMessage(`err audio cache ${_.get(scene, "name")}`);
            });

    if (forVideo)
        addToCache(urls, _.get(scene, "name"))
            .then(()=> {
                CacheActions.cacheMessage(`finished video cache ${_.get(scene, "name")}`);
            })
            .catch(() => {
                CacheActions.cacheMessage(`err video cache ${_.get(scene, "name")}`);
            });
}

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

    componentWillUnmount: function () {
        console.log("media-object-list unmounting")
    },

    componentWillUpdate: function (nextProps, nextState) {
        //Only update selectedIndex state if changed
        if (this.props.focusedMediaObject !== nextProps.focusedMediaObject)
            this.setState({selectedIndex: nextProps.focusedMediaObject});
    },

    cacheTranscodedVideo: function () {
        addSceneMediaToCache(this.props.scene, false, true);
    },

    cacheAudio: function () {
        addSceneMediaToCache(this.props.scene, true, false);
    },

    downloadMediaObjects: function(items) {
        var urls = [];
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
        var filename = this.props.scene._id + "_" + this.props.scene.name + searchTerm + ".zip";
        MediaDownloader.downloadAsZipFile(urls, filename);
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
            <div style={{overflowY: "none", height: 'calc(100% - 30px)'}}>
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
                                var downloader = new ThemeDownloader();
                                downloader.download(this.props.scene);
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

                <div className='btn-group btn-group-xs' role='group'>
                    <button type='button' className="btn btn-default" onClick={this.cacheTranscodedVideo}>
                        Cache Transcoded Video
                    </button>
                    <button type='button' className="btn btn-default" onClick={this.cacheAudio}>
                        Cache Audio
                    </button>
                </div>

                <div className={wrapperClass}>
                    <ul>{items}</ul>
                </div>
            </div>
        );
    }

});

module.exports = MediaObjectList;
