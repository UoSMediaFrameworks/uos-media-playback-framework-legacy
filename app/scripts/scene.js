'use strict';
mediaScenePlayer($('body'), loadMediaScene());

$('.edit-scene').attr('href', 'index.html?scene=' + $.url().param('scene'));