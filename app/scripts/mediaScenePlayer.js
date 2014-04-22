'use strict';

var loadMediaScene = (function() {
    var defaultMediaScene = {
        version: '1',
        name: 'scene1',
        scene: [
            {
                mediaObject: {
                    name: 'image',
                    type: 'image',
                    mimeType: 'image/jpeg',
                    url: 'http://www.rabbit.org/adoption/bunny.jpg',
                    anmiationIn: 'default',
                    anmiationOut: 'default',
                    cachePolicy: 'default',
                    tags: 'some,tags'
                }
            },
            {
                mediaObject: {
                    name: 'image',
                    type: 'image',
                    mimeType: 'image/jpeg',
                    url: 'http://www.safehavenrr.org/Images/bunny.jpg',
                    anmiationIn: 'default',
                    anmiationOut: 'default',
                    cachePolicy: 'default',
                    tags: 'some,tags'
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

        playScene: function() {
            var self = this;
            setInterval(function() {
                var url = self.randomImage().mediaObject.url;
                var img = self.showImage(url);
                setTimeout(function() {
                    self.animateOutImage(img);
                }, 6000);

            }, 3000);
        },

        randomImage: function() {
            var scene = this.mediaScene.scene;
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
        }
    };

    var constructor = function(el, mediaScene) {
        var instance = Object.create(methods);
        instance.el = el;
        instance.mediaScene = mediaScene;
        instance.elWidth = el.width();
        instance.elHeight = el.height();

        if ( mediaScene ) {
            instance.playScene();
        }

        return instance;
    };

    return constructor;
}());
