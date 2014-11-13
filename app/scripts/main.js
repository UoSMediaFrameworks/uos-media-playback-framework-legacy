'use strict';

angular.module('MediaPlayer', [
    'MediaPlayer.controllers',
    'MediaPlayer.services',
    'MediaPlayer.directives',
    'MediaPlayer.filters',
    'MediaPlayer.libs',
    'xeditable',
    'ui.bootstrap'
])
 
.constant('mediaSceneJSONPath', 'default_media_scene.json')

.constant('defaultHubUrl', 'http://localhost:3000/')

.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
