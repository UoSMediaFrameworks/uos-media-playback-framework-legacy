'use strict';

var MediaSceneEditor = Ractive.extend({
    addMediaObject: function() {
        this.get('newTags');

    },

    init: function(options) {
        this.set('mediaScene', options.mediaScene);
        this.mediaPlayer = options.mediaPlayer;

        this.on({
            newMediaObject: function(event) {
                var mediaObject = {
                    url: this.get('newUrl'),
                    animiationIn: 'default',
                    animiationOut: 'default',
                    cachePolicy: 'default',
                    tags: this.get('newTags')
                };

                switch (this.get('mediaType')) {
                case 'image':
                    mediaObject = _.extend(mediaObject, {
                        name: 'image',
                        type: 'image',
                        mimeType: 'image/jpeg'

                    });
                    break;

                case 'video':
                    mediaObject = _.extend(mediaObject, {
                        name: 'video',
                        type: 'video'
                    });
                    break;

                case 'audio':
                    // todo
                    break;
                }

                this.getScene().push({
                    mediaObject: mediaObject
                });

                this.set({newUrl: '', newTags: ''});

                event.original.preventDefault();
            },

            preview: function(event) {
                this.mediaPlayer.showMediaObject(this.get(event.keypath).mediaObject, true);
            },

            remove: function(event) {
                var index = event.index.i;
                this.getScene().splice(index, 1);
            },

            displayScene: function(event) {
                var key = this.get('mediaScene.name');
                localStorage[key] = JSON.stringify(this.get('mediaScene'));
                window.location.href = 'scene.html?scene=' + key;
            },

            updateScene: function(event) {
                var newScene = JSON.parse(event.node.value);
                this.set('mediaScene', newScene);
            },

            acceptMediaType: function(event, type) {
                this.set('mediaType', type);
            }
        });
    },

    getScene: function() {
        return this.get('mediaScene.scene');
    }
});



new MediaSceneEditor({
    el: 'editor',
    data: {
        mediaType: 'image'
    },
    template: '#media-scene-editor',
    mediaPlayer: mediaScenePlayer($('#canvas')),
    mediaScene: loadMediaScene()
});
