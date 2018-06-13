var React = require('react');

//stores
var SceneListStore = require('../../stores/scene-list-store');
var MFAPI = require('../../utils/mf-api');
var _ = require('lodash');


var ConfigSwapper = React.createClass({
    getInitialState: function () {
        return {
            sceneList: SceneListStore.getAll()
        }
    },
    onSceneListChange: function () {
        this.setState({sceneList: SceneListStore.getAll()})
    },
    componentDidMount: function () {
        SceneListStore.addChangeListener(this.onSceneListChange);
    },
    componentWillUnmount: function () {
        SceneListStore.removeChangeListener(this.onSceneListChange);
    },
    swapConfig: function (obj, e) {
        //api swap config
        console.log("swap", obj)
        MFAPI.SendSceneConfig(obj);
    },
    getSceneConfigElements: function (scene) {
        var self = this;

        var el = _.map(scene._config, function (config, i) {
            return (<li key={i} className="theme-slider-cont">
                <button type="button" className='btn btn-dark navbar-btn'
                        onClick={self.swapConfig.bind(null, {
                            sceneId: scene._id,
                            config: config.name
                        })}>{config.name}</button>
            </li>)

        });
        console.log("el", el)
        return el;
    },
    getSceneEL: function () {
        try {
            var self = this;
            var sceneEL = _.map(self.state.sceneList, function (scene, i) {
                if (!scene._config) {
                    return null;
                }
                if (scene.name == "" || scene.name == undefined) {
                    return null;
                } else {
                    var configs = self.getSceneConfigElements(scene);
                    return (
                        <li key={i} className={"slider-cont"}>
                            <label
                                className={"scene-slider"}>{"Name: " + scene.name} </label>
                            <ul>
                                {configs}
                            </ul>
                        </li>
                    )
                }
            });
            console.log("scene el", sceneEL);
            return sceneEL;
        } catch (e) {
            console.log("e", e)
        }


    },

    render: function () {

        var sceneConfigs = this.getSceneEL();

        return (
            <div>
                <ul className={"slider-list-cont"}>
                    {sceneConfigs}
                </ul>
            </div>
        )
    }


});
module.exports = ConfigSwapper;
