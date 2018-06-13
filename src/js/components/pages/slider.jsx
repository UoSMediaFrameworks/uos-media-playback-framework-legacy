var React = require('react');

//stores
var SceneListStore = require('../../stores/scene-list-store');
var MFAPI = require('../../utils/mf-api');
var _ = require('lodash');
var GridStore = require('../../stores/grid-store');
var MessageArray = [];

var VolumeSlider = React.createClass({

        getInitialState: function () {
            return {
                sceneList: SceneListStore.getAll(),
                limiterEnabled: false
            }
        },
        onSceneListChange() {
            this.setState({sceneList: SceneListStore.getAll()})
        },
        handleLimiterToggle() {
            console.log("limiter toggled")
            this.setState({limiterEnabled: !this.state.limiterEnabled})
        },
        componentDidMount: function () {
            SceneListStore.addChangeListener(this.onSceneListChange);
        },
        componentWillUnmount() {
            SceneListStore.removeChangeListener(this.onSceneListChange);
        },
        getThemeVolumeSliders: function (scene) {
            var self =this;
            try{
                if(scene._themes != null){
                    var ThemeVolumeSliders = _.map(Object.keys(scene._themes), function (theme) {

                        return (<li key={scene._id + "-" + theme} className="theme-slider-cont">
                            <label className={"theme-slider"}>{"Theme: " + theme} </label>
                            <input className={"range"} type="range" min="0" max="100"
                                   onChange={self.themeVolumeSliderHandler.bind(null, {sceneId: scene._id, theme: theme})}
                                   step="1"/>
                        </li>)
                    })
                }else{
                    return null;
                }
            }catch(e){
                console.log("theme slider err",e)
                return null;
            }
            return ThemeVolumeSliders;
        },
        requestScene(obj,e){
            GridStore.focusScene(obj)
        },
        getVolumeSlider() {
            var self = this;

            var sliderElements = _.map(self.state.sceneList, function (scene) {
                if (scene.name == "" || scene.name == undefined) {
                    return null;
                } else {
                    var themes = self.getThemeVolumeSliders(scene);
                    return (
                        <li className="col-mid-12 slider-cont" key={scene._id}>
                            <label onClick={self.requestScene.bind(null,scene)} className={"scene-slider"}>{"Name: " + scene.name} </label>
                            <input className={"range"} type="range" min="0" max="100"
                                   onChange={self.volumeSliderHandler.bind(null, scene)} step="1"/>

                                    <ul>
                                        {themes}
                                    </ul>
                        </li>
                    )
                }
            });
            return sliderElements;
        },
        themeVolumeSliderHandler(obj,evt) {
            console.log("volume slider", evt.target.value / 100, obj);
        },
        volumeSliderHandler(scene, evt) {
            console.log("slider", evt.target.value / 100, scene);
            if (this.state.limiterEnabled) {
                MessageArray.push({sceneId: scene._id, rescaleValue: evt.target.value / 100});
                if (MessageArray.length == 50) {

                    var scenes = _.uniq(MessageArray, function (m) {
                        return m.sceneId;
                    });
                    _.each(scenes, function (s) {
                        var messages = _.filter(MessageArray, {sceneId: s.sceneId});

                        var sum = _.sum(messages, function (object) {
                            return object.rescaleValue;
                        })
                        var avg = sum / messages.length;

                        MFAPI.sendAudioScale({sceneId: s.sceneId, rescaleValue: avg});
                    });
                    MessageArray = [];
                }
            } else {
                MFAPI.sendAudioScale({sceneId: scene._id, rescaleValue: evt.target.value / 100});
            }


        },
        render: function () {
            console.log("slider state",this.state.sceneList)
            var sceneVolumeSlider = this.getVolumeSlider();
            return (
                <div className={"slider-component"}>
                    <input type="checkbox" onChange={this.state.handleLimiterToggle}></input>
                    <ul className={"slider-list-cont"}>
                        {sceneVolumeSlider}
                    </ul>
                </div>
            )

        }
    }
);

module.exports = VolumeSlider;
