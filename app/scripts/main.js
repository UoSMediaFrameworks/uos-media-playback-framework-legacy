'use strict';

angular.module('MediaPlayer', [
    'MediaPlayer.controllers',
    'MediaPlayer.services',
    'MediaPlayer.directives',
    'MediaPlayer.filters',
    'MediaPlayer.libs',
    'xeditable'
])
 
.constant('mediaSceneJSONPath', 'default_media_scene.json')

.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
