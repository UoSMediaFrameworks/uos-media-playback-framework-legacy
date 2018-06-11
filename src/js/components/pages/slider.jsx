var React = require('react');

//stores
var SceneListStore = require('../../stores/scene-list-store');
var HubClient = require('../../utils/HubClient')
var _ = require('lodash');

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
            var self =this;
            var sliderElements= _.map(self.state.sceneList,function(scene){
                if(scene.name == null){
                    return null;
                }else{
                    return(
                        <li>
                            <label>{"ID: " + scene._id} </label>
                            <label>{"Name: " + scene.name} </label>
                            <input type="range" key={scene._id} className="slider" min="0" max="100"  onChange={self.volumeSliderHandler.bind(null,scene)} step="1"/>
                        </li>
                    )
                }
            })
            return sliderElements;
        },
        volumeSliderHandler(f,evt) {
            console.log("slider",evt.target.value/100,f)
          HubClient.publishVolumeScale({sceneId:f._id,rescaleFactor:evt.target.value/100})
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
