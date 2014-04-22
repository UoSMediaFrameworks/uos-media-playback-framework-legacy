'use strict';

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
                this.mediaPlayer.showImage(this.get(event.keypath).mediaObject.url, true);
            },

            displayScene: function(event) {
                var key = this.mediaScene.name;
                localStorage[key] = JSON.stringify(this.mediaScene);
                window.open('scene.html?scene=' + key);
            }
        });
    }
});



new MediaSceneEditor({
    el: 'editor',
    template: '#media-scene-editor',
    mediaPlayer: mediaScenePlayer($('#canvas')),
    mediaScene: loadMediaScene()
});



