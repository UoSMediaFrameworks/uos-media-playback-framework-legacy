var React = require('react');
var RateLimiter = require('limiter').RateLimiter;
//stores
var SceneListStore = require('../../stores/scene-list-store');
var MFAPI = require('../../utils/mf-api');
var _ = require('lodash');
var limit = RateLimiter(1, 250);
var MessageArray = [];
var VolumeSlider = React.createClass({

        getInitialState: function () {
            return {
                sceneList: SceneListStore.getAll()
            }
        },
        onSceneListChange() {
            this.setState({sceneList: SceneListStore.getAll()})
        },
        componentDidMount: function () {
            SceneListStore.addChangeListener(this.onSceneListChange);
        },
        componentWillUnmount() {
            SceneListStore.removeChangeListener(this.onSceneListChange);
        },
        getVolumeSlider() {
            var self = this;
            var sliderElements = _.map(self.state.sceneList, function (scene) {
                if (scene.name == null) {
                    return null;
                } else {
                    return (
                        <li>
                            <label>{"ID: " + scene._id} </label>
                            <label>{"Name: " + scene.name} </label>
                            <input type="range" key={scene._id} className="slider" min="0" max="100"
                                   onChange={self.volumeSliderHandler.bind(null, scene)} step="1"/>
                        </li>
                    )
                }
            })
            return sliderElements;
        },
        volumeSliderHandler(f, evt) {
            console.log("slider", evt.target.value / 100, f);
            MessageArray.push({sceneId: f._id, rescaleValue: evt.target.value / 100});
            if (MessageArray.length == 50) {

                var scenes = _.uniq(MessageArray, function (m) {
                    return m.sceneId;
                });
                _.each(scenes, function (s) {
                    var messages = _.filter(MessageArray, {sceneId: s.sceneId});

                    var sum = _.sum(messages,function (object) {
                        return object.rescaleValue;
                    })
                    var avg = sum/messages.length;

                    MFAPI.sendAudioScale({sceneId: s.sceneId,rescaleValue:avg});
                });
                MessageArray=[];
            }
        },
        render: function () {
            var sceneVolumeSlider = this.getVolumeSlider();
            return (
                <ul>
                    {sceneVolumeSlider}
                </ul>
            )

        }
    }
);

module.exports = VolumeSlider;
