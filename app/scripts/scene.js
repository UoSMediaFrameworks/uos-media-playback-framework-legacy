'use strict';
mediaScenePlayer($('body'), loadMediaScene());

$('.edit-scene').click(function() {
    window.open('index.html?scene=' + $.url().param('scene'));
});