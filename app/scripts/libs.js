'use strict';

/*global _: false, Howl: false, purl: false, $: false */

angular.module('MediaPlayer.libs', [])

.factory('_', function() {
    return _;
})

.factory('purl', function() {
    return purl;
})

.factory('$', function() {
    return $;
})


.factory('Howl', function() {
    return Howl;
});
