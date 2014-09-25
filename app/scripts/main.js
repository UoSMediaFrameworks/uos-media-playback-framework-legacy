'use strict';

var angular = require('angular');

require('angular-xeditable');

angular.module('MediaPlayer', [
    require('./controllers'),
    require('./services'),
    require('./directives'),
    require('./filters'),
    'xeditable'
])

.constant('mediaSceneJSONPath', 'default_media_scene.json')

.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});