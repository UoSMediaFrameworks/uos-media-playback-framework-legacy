'use strict';

var MediaSceneEditor = Ractive.extend({
    addMediaObject: function() {
        this.get('newTags');

    },

    init: function(options) {
        this.mediaScene = options.mediaScene;
        this.set('scene', this.mediaScene.scene);

        this.on({
            newMediaObject: function(event) {
                this.mediaScene.scene.push({
                    mediaObject: {
                        name: 'image',
                        type: 'image',
                        mimeType: 'image/jpeg',
                        url: this.get('newUrl'),
                        anmiationIn: 'default',
                        anmiationOut: 'default',
                        cachePolicy: 'default',
                        tags: this.get('newTags')
                    }
                });

                this.set({newUrl: '', newTags: ''});


                event.original.preventDefault();
            },

            preview: function(event) {
                console.log(this.get(event.keypath));
            }
        });
    }
});

new MediaSceneEditor({
    el: 'editor',
    template: '#media-scene-editor',
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