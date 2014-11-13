'use strict';
/*global YT: false, Image: false */

angular.module('MediaPlayer.services', [])

.factory('mediaScene', ['$location', 'resourceCache', 'mediaSceneJSONPath', function($location, resourceCache, mediaSceneJSONPath) {
    return function (){
        var mediaScene = {};

        resourceCache.get(mediaSceneJSONPath).success(function (data) {
            angular.copy(data, mediaScene);
        });

        return mediaScene;
    };
}])

.factory('resourceCache', ['$http', '$cacheFactory', function($http, $cacheFactory) {
    var promises = {};
    var cache = $cacheFactory('resourceCache');
    return {
        get: function(path) {
            if (! promises.hasOwnProperty(path)) {
                promises[path] = $http({
                    method: 'GET',
                    url: path,
                    cache: cache
                });
            }

            return promises[path];
        },
        put: function(path, data) {
            cache.put(path, data);
        }
    };
}])

.service('hub', function(hubClient) {
    var client;
    
    this.connect = function(url, password) {
        client = hubClient(url);
        return client.authenticate(password);
    };
})

.service('youtubePlayer', function($document, $window, purl) {
    var apiLoaded = false,
        callbacks = [],
        players = [];

    // load in the iframe player api
    var doc = $document[0],
        tag = doc.createElement('script');

    tag.src = 'https://www.youtube.com/iframe_api';
    
    var body = doc.getElementsByTagName('body')[0];
    body.appendChild(tag);

    $window.onYouTubeIframeAPIReady = function () {
        apiLoaded = true;

        angular.forEach(callbacks, function(func) {
            func();
        });
    };

    this.create = function(id, url, completeCallback) {
        var func = function() {
            players.push(new YT.Player(id, {
                height: '390',
                width: '640',
                videoId: purl(url).param('v'),
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    playsinline: 1
                },
                events: {
                    onReady: function(event) {
                        event.target.playVideo();
                    },
                    onStateChange: function(event) {
                        if (event.data === YT.PlayerState.ENDED) {
                            var player = event.target;
                            player.destroy();
                            players.splice(players.indexOf(player), 1);

                            if (completeCallback) {
                                completeCallback();
                            }
                        }
                    }
                }
            }));
        };

        if (apiLoaded) {
            func();
        } else {
            callbacks.push(func);
        }
    };

    this.destroyAll = function() {
        angular.forEach(players, function(player) {
            player.destroy();
        });
        players = [];
    };

})

.service('playerElementManager', function($timeout, youtubePlayer, $) {
    var self = this;

    function animateInImage(img) {
        self.$element.append(img);

        // random start position
        img.css({
            left: Math.random() * (self.elWidth - img.width()),
            top: Math.random() * (self.elHeight - img.height())
        });

        // and show
        img.animate({'opacity': 1}, 1400);
    }

    function animateOutImage(img) {
        img.animate({'opacity': 0}, 1400, function () {
            img.remove();
        });
    }

    this.init = function($element) {
        self.$element = $($element);
        self.elWidth = self.$element.width();
        self.elHeight = self.$element.height();
        self.timeouts = [];
    };

    this.clearStage = function() {
        self.$element.empty();
    };

    this.showImage = function(url) {
        var imgEl = new Image();
        var img = $(imgEl);
        imgEl.onload = function() {
            img.addClass('image-media-object');
            animateInImage(img);
            self.timeouts.push($timeout(function() {
                animateOutImage(img);
            }, 6000, false));
        };

        imgEl.src = url;
    };

    this.showVideo = function(url, completeCallback) {
        var id = 'id' + Date.now(),
            html = '<div id="' + id + '"></div>';

        self.$element.append(html);

        youtubePlayer.create(id, url, completeCallback);
    };
});
