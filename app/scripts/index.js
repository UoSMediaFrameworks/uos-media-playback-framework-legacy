'use strict';
/* global _: false */
/* global Ractive: false */

var MediaSceneEditor = Ractive.extend({
    addMediaObject: function() {
        this.get('newTags');

    },

    startPlayer: function() {
        this.mediaPlayer.playScene();
        this.set('playerState', 'playing');
    },

    stopPlayer: function() {
        this.mediaPlayer.stopScene();
        this.set('playerState', 'stopped');
    },

    init: function(options) {
        this.set('mediaScene', options.mediaScene);
        this.set('playerState', 'stopped');
        this.mediaPlayer = options.mediaPlayer;
        this.set('editing', []);

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
                    mediaObject = _.extend(mediaObject, {
                        name: 'audio',
                        type: 'audio'
                    });
                    break;
                }

                this.getScene().push({
                    mediaObject: mediaObject
                });

                this.set({newUrl: '', newTags: ''});

                event.original.preventDefault();
            },

            preview: function(event) {
                this.stopPlayer();
                this.mediaPlayer.showMediaObject(this.get(event.keypath).mediaObject, true);
            },

            remove: function(event) {
                var index = event.index.i;
                this.getScene().splice(index, 1);
            },

            previewScene: function(event) {
                // ensure we pass a fresh object
                this.mediaPlayer.setMediaScene(JSON.parse(JSON.stringify(this.get('mediaScene'))));
                this.startPlayer();
            },

            stopScene: function(event) {
                this.stopPlayer();
            },

            viewScene: function(event) {
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
            },

            editField: function(event, attributeName) {
                console.log(event, attributeName);
                var self = this,
                    index = event.index.i,
                    attributePath = 'mediaScene.scene.'+ index + '.mediaObject.' + attributeName,
                    currentValue = this.get(attributePath),
                    keydownHandler, blurHandler, input;

                this.set('editing.' + index + '.' + attributeName, true);

                input = this.nodes.editor;
                input.select();

                window.addEventListener( 'keydown', keydownHandler = function ( event ) {
                    switch ( event.which ) {
                    case 13: // ENTER
                        input.blur();
                        break;

                    case 27: // ESCAPE
                        input.value = currentValue;
                        self.set(attributePath, currentValue);
                        input.blur();
                        break;

                    }
                });

                input.addEventListener( 'blur', blurHandler = function () {
                    window.removeEventListener( 'keydown', keydownHandler );
                    input.removeEventListener( 'blur', blurHandler );
                });
            },

            stopEditing: function(event, attributeName) {
                this.set('editing.' + event.index.i + '.' + attributeName, false);
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
