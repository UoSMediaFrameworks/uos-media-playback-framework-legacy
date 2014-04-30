'use strict';
var player = mediaScenePlayer($('body'), loadMediaScene());

$('.edit-scene').attr('href', 'index.html?scene=' + $.url().param('scene'));

$('.tag-filter').blur(function() {
    player.filterByTags(this.value);
});