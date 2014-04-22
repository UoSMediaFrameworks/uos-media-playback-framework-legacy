'use strict';

var mediaScenePlayer = (function() {
    var methods = {
        showImage: function(url) {
            var el = this.el;
            var scope = this;
            this.preloadImage(url, function(img) {
                // put it off screen
                var imgEl = $(img);
                el.empty().append(imgEl);
                scope.animateImage(imgEl);
            });
        },

        animateImage: function(img) {
            // random start position
            img.css({
                left: Math.random() * (this.elWidth - img.width()),
                top: Math.random() * (this.elHeight - img.height())
            });

            // and show
            TweenLite.to(img, 2, {opacity: 1});
        },

        preloadImage: function(url, callback) {
            var img = new Image();
            img.onload = function() {
                callback(img);
            };

            img.src = url;
        }
    };

    var constructor = function(el) {
        var instance = Object.create(methods);
        instance.el = el;
        instance.elWidth = el.width();
        instance.elHeight = el.height();

        return instance;
    };

    return constructor;
}());

var MediaSceneEditor = Ractive.extend({
    addMediaObject: function() {
        this.get('newTags');

    },

    init: function(options) {
        this.mediaScene = options.mediaScene;
        this.set('scene', this.mediaScene.scene);
        this.mediaPlayer = options.mediaPlayer;

        this.on({
            newMediaObject: function(event) {
                this.mediaScene.scene.push({
                    mediaObject: {
                        name: 'image',
                        type: 'image',
                        mimeType: 'image/jpeg',
                        url: this.get('newUrl'),
                        animiationIn: 'default',
                        animiationOut: 'default',
                        cachePolicy: 'default',
                        tags: this.get('newTags')
                    }
                });

                this.set({newUrl: '', newTags: ''});

                event.original.preventDefault();
            },

            preview: function(event) {
                this.mediaPlayer.showImage(this.get(event.keypath).mediaObject.url);
            },

            displayScene: function(event) {
                var key = this.mediaScene.name;
                localStorage[key] = JSON.stringify(this.mediaScene);
                window.open('scenePlayer.html?scene=' + key);
            }
        });
    }
});

new MediaSceneEditor({
    el: 'editor',
    template: '#media-scene-editor',
    mediaPlayer: mediaScenePlayer($('#canvas')),
    mediaScene: {
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
    }
});



