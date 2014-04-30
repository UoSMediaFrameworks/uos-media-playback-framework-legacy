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

    var filterMediaSceneByTags = function(mediaScene, tagsArray) {
        if ( tagsArray.length > 0 ) {
            return _.filter(mediaScene.scene, function (obj) {
                if (_.intersection(obj.mediaObject.tags, tagsArray).length > 0) {
                    return true;
                }
            });
        } else {
            return mediaScene.scene;
        }
    };

    var methods = {
        showImage: function(url, clear) {
            var el = this.el;
            var self = this;
            return this.makeImage(url, function(img) {
                img.addClass('image-media-object');
                if ( clear ) {
                    el.empty();
                }
                el.append(img);
                self.animateInImage(img);
            });
        },

        setMediaScene: function(mediaScene) {
            var newScene = _.clone(mediaScene);
            // tokenize the tags
            newScene.scene = _.map(newScene.scene, function (obj) {
                obj.mediaObject.tags = tokenizeTags(obj.mediaObject.tags);
                return obj;
            });

            this.filteredMediaObjects = filterMediaSceneByTags(newScene, this.tagTokens);
            this.mediaScene = newScene;
        },

        playScene: function() {
            var self = this;

            setInterval(function() {
                var obj = self.randomImage();

                if ( obj ) {
                    var url = obj.mediaObject.url;
                    var img = self.showImage(url);
                    setTimeout(function() {
                        self.animateOutImage(img);
                    }, 6000);
                } else {
                    console.log('no image to show');
                }

            }, 3000);
        },

        randomImage: function() {
            var scene = this.filteredMediaObjects;
            return scene[Math.floor(Math.random()*scene.length)];
        },

        animateInImage: function(img) {
            // random start position
            img.css({
                left: Math.random() * (this.elWidth - img.width()),
                top: Math.random() * (this.elHeight - img.height())
            });

            // and show
            TweenLite.to(img, 2, {opacity: 1});
        },

        animateOutImage: function(img) {
            TweenLite.to(img, 2, {opacity: 0, onComplete: function() {
                img.remove();
            }});
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
            if ( tags ) {
                this.tagTokens = tokenizeTags(tags);
            } else {
                this.tagTokens = [];
            }

            if ( this.mediaScene ) {
                this.filteredMediaObjects = filterMediaSceneByTags(this.mediaScene, this.tagTokens);
            }
        }
    };

    var constructor = function(el, mediaScene, tagString) {
        var instance = Object.create(methods);
        instance.el = el;
        instance.elWidth = el.width();
        instance.elHeight = el.height();

        instance.filterByTags(tagString)

        if ( mediaScene ) {
            instance.setMediaScene(mediaScene);
            instance.playScene();
        }

        return instance;
    };

    return constructor;
}());
