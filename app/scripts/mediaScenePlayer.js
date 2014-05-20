'use strict';

var loadMediaScene = (function() {
    var defaultMediaScene = {
  "version": "1",
  "name": "scene1",
  "scene": [
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://www.safehavenrr.org/Images/bunny.jpg",
        "anmiationIn": "default",
        "anmiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://www.rabbit.org/adoption/bunny.jpg",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://www.ikea.com/us/en/images/products/kritter-childrens-chair__0096632_PE236603_S4.JPG",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "chair"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://upload.wikimedia.org/wikipedia/commons/2/2c/Art_deco_club_chair.jpg",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "chair"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://research.fuseink.com/artifactimg/201210/MTM1MTUwOTc2MDE1MjYxXzE.jpg",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit, chair"
      }
    },
    {
      "mediaObject": {
        "name": "image",
        "type": "image",
        "mimeType": "image/jpeg",
        "url": "http://bestrainer.net/wp-content/uploads/2012/07/Captura-de-pantalla-2012-07-12-a-las-09.09.21-301x398.png",
        "animiationIn": "default",
        "animiationOut": "default",
        "cachePolicy": "default",
        "tags": "rabbit, chair"
      }
    },
    {
        "mediaObject": {
            "url": "https://www.youtube.com/watch?v=cY_22EZRI-Y",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "rabbit",
            "name": "video",
            "type": "video"
        }
    },
    {
        "mediaObject": {
            "url": "http://www.therecordist.com/assets/sound/mp3_14/Gun_AK47_Machine_Gun_1.mp3",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "gun",
            "name": "audio",
            "type": "audio"
        }
    },
    {
        "mediaObject": {
            "url": "http://www.therecordist.com/assets/sound/mp3_14/Water_Splash_1.mp3",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "splash",
            "name": "audio",
            "type": "audio"
        }
    },
    {
        "mediaObject": {
            "url": "http://www.therecordist.com/assets/sound/mp3_14/Thunder_Clap_Spring.mp3",
            "animiationIn": "default",
            "animiationOut": "default",
            "cachePolicy": "default",
            "tags": "thunder",
            "name": "audio",
            "type": "audio"
        }
    }
  ]
};

    return function() {
        var sceneKey = $.url().param('scene');
        if  (sceneKey && localStorage[sceneKey])
        {
            return JSON.parse(localStorage[sceneKey]);
        }
        else {
            return defaultMediaScene;
        }
    };

}());

var mediaScenePlayer = (function() {
    var tokenizeTags = function(tagString) {
        // clean up tags into nice array, removing any empty strings
        var tags = _.map(tagString.split(','), function (s) { return s.trim(); });
        return _.filter(tags, function(s) { return s !== ""});
    };

    var filterMediaScene = function(mediaScene, tagsArray, mediaType) {
        return _.filter(mediaScene.scene, function (obj) {
            if ((tagsArray.length == 0 || _.intersection(obj.mediaObject.tags, tagsArray).length > 0 ) &&
                (! mediaType || obj.mediaObject.type === mediaType)) {
                return true;
            }
        });
    };
    var ytAPILoaded = false;
    var ytLoading = false;
    var ytLoadCallbacks = [];
    var ensureYouTubeApi = function(callback) {
        if ( ytAPILoaded && callback ) {
            callback();
        } else {
            if (callback) ytLoadCallbacks.push(callback);

            if (! ytLoading) {
                ytLoading = true;
                // set it ahead of time so we don't accidently double load
                // but hide the var from scope so no one tries to get smart with it
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";

                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = function() {
                    ytAPILoaded = true;
                    ytLoadCallbacks.forEach(function(func) {
                        func();
                    });
                };
            }

        }
    };

    var methods = {
        showMediaObject: function(mediaObject, clear, completeCallback) {
            var el = this.el;
            var self = this;

            if ( clear ) {
                el.empty();
            }

            switch (mediaObject.type) {
            case 'image':
                var img = this.showImage(mediaObject.url, clear);
                this.timeouts.push(setTimeout(function() {
                        self.animateOutImage(img);
                }, 6000));
                break;

            case 'video':
                var videoEL = $('<div id="youtubePlayer"></div>');
                el.append(videoEL);
                this.youtubePlayer = new YT.Player('youtubePlayer', {
                    height: '300',
                    width: '500',
                    videoId: $.url(mediaObject.url).param('v'),
                    playerVars: {
                        controls: 0,
                        showinfo: 0,
                        modestbranding: 1,
                        playsinline: 1,
                    },
                    events: {
                        onReady: function(event) {
                            event.target.playVideo();
                        },
                        onStateChange: function(event) {
                            if (event.data == YT.PlayerState.ENDED) {
                                self.youtubePlayer.destroy();
                                if (completeCallback) completeCallback();
                            }
                        }
                    }
                });
                break;
            case 'audio':
                this.audioPlayer = new Howl({
                    urls: [mediaObject.url],
                    onend: function () {
                        if (completeCallback) completeCallback();
                    }
                }).play();
                break;
            }
        },
        showImage: function(url) {
            var el = this.el;
            var self = this;
            return this.makeImage(url, function(img) {
                img.addClass('image-media-object');
                el.append(img);
                self.animateInImage(img);
            });
        },

        setMediaScene: function(mediaScene) {

            // tokenize the tags
            mediaScene.scene = _.map(mediaScene.scene, function (obj) {
                obj.mediaObject.tags = tokenizeTags(obj.mediaObject.tags);
                return obj;
            });
            this.mediaScene = mediaScene;
            this.filterByTags(this.tagString);
        },

        playScene: function() {
            var self = this;

            ensureYouTubeApi(function () {
                self.el.empty();

                var showRandomImage = function() {
                    self.showRandomMediaObject('image');
                };

                var showRandomVideo = function() {
                    self.showRandomMediaObject('video', false, showRandomVideo);
                }

                var showRandomAudio = function () {
                    self.showRandomMediaObject('audio', false, showRandomAudio);
                }

                self.intervals.push(setInterval(showRandomImage, 3000));
                showRandomImage();
                showRandomAudio();
                showRandomVideo();
            });

        },

        stopScene: function () {
            this.el.stop(true);
            if (this.youtubePlayer) this.youtubePlayer.stopVideo();
            if (this.audioPlayer) this.audioPlayer.stop();
            _.map(this.intervals, clearInterval);
            _.map(this.timeouts, clearTimeout);
            this.intervals = [];
            this.timeouts = [];
        },

        getRandomMedia: function(type) {
            var scene = this.filteredMediaObjects[type];
            var obj = scene[Math.floor(Math.random()*scene.length)];
            if ( obj ) {
                return obj;
            } else {
                console.log('no ' + type +'s in current scene');
            }
        },

        showRandomMediaObject: function(type) {
            var obj = this.getRandomMedia(type);
            if ( obj ) this.showMediaObject(obj.mediaObject);
        },

        animateInImage: function(img) {
            // random start position
            img.css({
                left: Math.random() * (this.elWidth - img.width()),
                top: Math.random() * (this.elHeight - img.height())
            });

            // and show
            img.animate({'opacity': 1}, 1400);
        },

        animateOutImage: function(img) {
            img.animate({'opacity': 0}, 1400, function () {
                img.remove()
            });
        },

        makeImage: function(url, callback) {
            var imgEl = new Image();
            var img = $(imgEl);
            imgEl.onload = function() {
                callback(img);
            };

            imgEl.src = url;

            return img;
        },

        filterByTags: function(tags) {
            this.tagString = tags;
            var tagTokens = [];
            if ( tags ) {
                tagTokens = tokenizeTags(tags);
            }
            this.filteredMediaObjects = {};
            if ( this.mediaScene ) {
                this.filteredMediaObjects.image = filterMediaScene(this.mediaScene, tagTokens, 'image');
                this.filteredMediaObjects.video = filterMediaScene(this.mediaScene, tagTokens, 'video');
                this.filteredMediaObjects.audio = filterMediaScene(this.mediaScene, tagTokens, 'audio');
            }
        }
    };

    var constructor = function(el, mediaScene, tagString) {
        var instance = Object.create(methods);
        instance.el = el;
        instance.elWidth = el.width();
        instance.elHeight = el.height();
        instance.intervals = [];
        instance.timeouts = [];

        instance.filterByTags(tagString)

        ensureYouTubeApi();


        if ( mediaScene ) {
            instance.setMediaScene(mediaScene);
            instance.playScene();
        }

        return instance;
    };

    return constructor;
}());
