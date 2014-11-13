'use strict';

angular.module('MediaPlayer.controllers', []) 

.controller('MediaSceneEditorCtrl', function($scope, mediaScene, playerElementManager, Howl, $modal) {

    $scope.playerState = {
        playing: false
    };
    
    $scope.hubState = {
        authenticated: false
    };

    $scope.newMediaObject = {
        type: 'video',
        url: undefined,
        tags: undefined,
        start: '00:00:00:00',
        end: '00:00:00:00'
    };

    $scope.mediaScene = mediaScene();

    $scope.addMediaObject = function() {

        var mediaObject = {
            animiationIn: 'default',
            animiationOut: 'default',
            cachePolicy: 'default'
        };
        angular.extend(mediaObject, $scope.newMediaObject);

        $scope.mediaScene.scene.push({mediaObject: mediaObject});

        // cleanup UI
        $scope.addMediaForm.$setPristine();
        $scope.newMediaObject.url = '';
        $scope.newMediaObject.tags = '';
    };

    $scope.btnSelected = function(btnName) {
        return btnName === $scope.newMediaObject.type ? 'btn-selected' : '';
    };

    $scope.previewMediaObject = function(obj) {
        var mo = obj.mediaObject,
            url = mo.url;
        switch(mo.type) {
        case 'image':
            playerElementManager.showImage(url);
            break;
        case 'audio':
            new Howl({
                urls: [url]
            }).play();
            break;
        case 'video':
            playerElementManager.showVideo(url);
            break;
        }
    };

    $scope.removeMediaObject = function(index) {
        $scope.mediaScene.scene.splice(index, 1);
    };
    
    $scope.connectToHub = function() {
        var modal = $modal.open({
            templateUrl: 'hubLoginModal.html',
            controller: 'LoginModalCtrl'
        });
        
        modal.result.then(function(success) {
            $scope.hubState.authenticated = true;
        });
        
    };
    
    $scope.saveScene = function () {
        
    }
})

.controller('LoginModalCtrl', function($scope, $modalInstance, defaultHubUrl, hub) {
    $scope.connecting = false;
    $scope.creds = {
        url: defaultHubUrl,
        password: ''
    };
    
    $scope.connect = function () {
        $scope.connecting = true;
        
        hub.connect($scope.creds.url, $scope.creds.password).then(function() {
            $modalInstance.close(true);
        }, function() {
            $scope.connecting = false;
            $scope.$apply(function () {
                $scope.error = true;    
            });
            
            console.log('error');
        });
        
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
})

.controller('MediaScenePlayerCtrl', function($scope, $attrs, playerElementManager, youtubePlayer, $interval, _, Howl) {
    function getRandomMediaObject(mediaScene, type) {
        var objs = filterMediaScene(mediaScene, [], type);
        return objs[Math.floor(Math.random() * objs.length)];
    }

    function filterMediaScene(mediaScene, tagsArray, mediaType) {
        return _.filter(mediaScene.scene, function (obj) {
            if ((tagsArray.length === 0 || _.intersection(obj.mediaObject.tags, tagsArray).length > 0 ) &&
                (! mediaType || obj.mediaObject.type === mediaType)) {
                return true;
            }
        });
    }

    var self = this;


    this.init = function($element) {
        playerElementManager.init($element);
    };

    this.playScene = function() {
        playerElementManager.clearStage();

        // images
        var imageRotater = function() {
            var obj = getRandomMediaObject($scope.mediaScene, 'image');
            playerElementManager.showImage(obj.mediaObject.url);
        };

        self.imageInterval = $interval(imageRotater, 3000, 0, false);
        imageRotater();

        // audio
        var audioRotator = function() {
            var obj = getRandomMediaObject($scope.mediaScene, 'audio');
            self.audioPlayer = new Howl({
                urls: [obj.mediaObject.url],
                onend: function () {
                    audioRotator();
                }
            }).play();
        };

        // video
        var videoRotator = function() {
            var obj = getRandomMediaObject($scope.mediaScene, 'video');
            playerElementManager.showVideo(obj.mediaObject.url, videoRotator);
        };

        audioRotator();
        videoRotator();

    };

    this.stopScene = function() {
        if (self.imageInterval) {
            $interval.cancel(self.imageInterval);
            self.imageInterval = null;
        }

        if (self.audioPlayer) {
            self.audioPlayer.stop();
        }

        youtubePlayer.destroyAll();
    };
});
