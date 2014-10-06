'use strict';

module.exports = 'MediaPlayer.directives';

var angular = require('angular'),
    _ = require('lodash');

angular.module(module.exports, [])

.directive('maMediaScenePlayer', function() {
    return {
        controller: 'MediaScenePlayerCtrl',
        scope: {
            mediaScene: '=',
            playing: '='
        },
        link: function($scope, iElm, iAttrs, ctrl) {
            ctrl.init(iElm, true);
            $scope.$watch('playing', function (playing) {
                if (playing) {
                    ctrl.playScene();
                } else {
                    ctrl.stopScene();
                }
            });
        }
    };
})

.directive('preloadResource', ['resourceCache', function(resourceCache) {
    return {
        link: function (scope, element, attrs) {
            resourceCache.put(attrs.preloadResource, element.html());
        }
    };
}])

.directive('maFormGroup', function() {
    return {
        require: '^form',
        link: function($scope, iElm, iAttrs, controller) {
            var field = function (prop) {
                    return controller.$name + '.' + iAttrs.name + '.' + prop;
                },
                form = $scope[controller.$name],
                formField = form[iAttrs.name],
                displayError = function () {
                    iElm.parent().toggleClass('has-error',
                        (form.$dirty || formField.$dirty) && formField.$invalid);
                };

            $scope.$watch(field('$valid'), displayError);
            $scope.$watch(field('$pristine'), displayError);
            $scope.$watch(controller.$name + '.$dirty', displayError);
        }
    };
})

.directive('maOnSubmit', ['$parse', function($parse) {
    return {
        require: '?form',
        restrict: 'A',
        link: function($scope, iElm, iAttrs, controller) {
            var fn = $parse(iAttrs.maOnSubmit);

            iElm.bind('submit', function(event) {
                if (! $scope.$$phase) {
                    $scope.$apply();
                }

                $scope.$apply(function () {
                    controller.$setDirty();
                });

                if (! controller.$valid) {
                    return false;
                }

                $scope.$apply(function() {
                    fn($scope, {$event: event});
                });
            });
        }
    };
}])

.directive('maTimecode', function() {
    return {
        require: 'ngModel',
        restrict: 'AE',
        scope: {},
        template: '<div class="">' +
                  '<input ng-model="hour" placeholder="HH" type="text"  ng-change="updateHour()" class="timecode-input">:' +
                  '<input ng-model="minute" placeholder="MM" type="text" ng-change="updateMinute()" class="timecode-input">:' +
                  '<input ng-model="second" placeholder="SS" type="text" ng-change="updateSecond()" class="timecode-input">:' +
                  '<input ng-model="frame" placeholder="FF" type="text" ng-change="updateFrame()" class="timecode-input">' +
                  '</div>',
        link: function($scope, elem, attr, ctrl) {
            var inputs = elem.find('input'),
                value = [undefined, undefined, undefined, undefined],
                invalidate = function(iHour, iMinute, iSecond, iFrame) {
                    ctrl.$setViewValue(null);
                    ctrl.$setValidity('timecode', false);

                    if (angular.isDefined(iHour)) { $scope.invalidHour = iHour; }
                    if (angular.isDefined(iMinute)) { $scope.invalidMinute = iMinute; }
                    if (angular.isDefined(iSecond)) { $scope.invalidHour = iSecond; }
                    if (angular.isDefined(iFrame)) { $scope.invalidHour = iFrame; }
                };

            $scope.updateHour = function() {
                var hour = parseInt(scope.hour, 10),
                    valid = (hour >= 0);

                if (valid) {

                } else {
                    invalidate(true);
                }

                return hour;
            }

            ctrl.$render = function() {
                //var vals = ctrl.$viewValue.split(':');
                //console.log('$render', ctrl.$viewValue);
                var vals = ['h'];
                // for (var i = 0; i < 4; i++) {
                //     inputs[i].value = vals[i];
                // }
                // console.log('viewValue', ctrl.$viewValue, ctrl);
                $scope.hour = vals[0];
                $scope.minute = vals[1];
                $scope.second = vals[2];
                $scope.frame = vals[3];
            };

            $scope.updateModel = function() {
                var values = _.map(inputs, function(i) { return parseInt(i.value, 10); }),
                    newTimecode = _.reduce(values, function(acc, val) {
                        return acc + ':' + val;
                    });

                $scope.$apply(function() {
                    ctrl.$setViewValue(newTimecode);
                });
            };
        }
    };
})

.directive('jsonInput', function() {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr) {
            var scopeName = attr.jsonInput,
                formGroup = elem.parent();

            elem.bind('blur', function () {
                $scope.$apply(function() {
                    try {
                        var obj = JSON.parse(elem.val());
                        angular.copy(obj, $scope[scopeName]);
                        formGroup.removeClass('has-error');
                    } catch (e) {
                        // silence bad json
                        if (e instanceof SyntaxError) {
                            formGroup.addClass('has-error');
                        } else {
                            throw e;
                        }
                    }
                });
            });

            $scope.$watch(scopeName, function () {
                elem.val(angular.toJson($scope[attr.jsonInput], true));
                formGroup.removeClass('has-error');
            }, true);
        }
    };
});
