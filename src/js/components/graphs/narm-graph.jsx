var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var Circle = require("./narm-components/circle.jsx");
var Path = require("./narm-components/path.jsx");
var Text = require("./narm-components/text.jsx");
var _ = require("lodash");
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");


var NarmGraph = React.createClass({

    getInitialState: function () {
        return {data: null}
    },
    componentWillMount: function () {
        console.log("will mount", this.props)
        /*        this.setState({data:this.props.data})*/
    },
    componentWillReceiveProps: function (nextProps) {
        console.log("the props", nextProps);
        this.setState({data: this.props.data})
    },
    highlight: function (data) {
        var self = this;
        var filteredEdges;
        _.each(self.state.data.nodes, function (node) {
            node.highlighted = false
        });
        _.each(self.state.data.links, function (link) {
            link.highlighted = false;
        });
        if (data.type == 'root') {
            filteredEdges = _.filter(self.state.data.links, function (item) {
                return item.source.type == 'city' || item.target.type == 'city';
            })
        } else if (data.type == 'city') {
            filteredEdges = _.filter(self.state.data.links, function (item) {
                return item.source.type != 'root';
            })
        } else {
            filteredEdges = self.state.data.links;
        }
        var node = _.filter(self.state.data.nodes, function (node) {
            return node._id == data._id;
        });

        _.each(node, function (node) {
            node.highlighted = true;
        });
        var links = _.filter(filteredEdges, function (item) {
            return item.source == data || item.target == data;
        });
        _.each(links, function (link) {
            link.highlighted = true;
        });
        this.setState({data: self.state.data});
    },
    tapHandler(t){
        console.log("clicked");
        this.highlight(t)
        var list = [];
        if (t.type === "root") {
            //FOR ROOT NODES ONLY SEARCH GTHEMES FOR STHEME + SCENES
            var children = _.filter(t.children, function (child) {
                return child.type === "subgraphtheme";
            });

            list = this._nodes(children, list);
        } else if (t.type !== "scene") {
            list = this._nodes(t.children, list);
        } else {
            list.push(t._id);
        }

        list = this.dedupeNodeList(list);
        //To finalize this method it sends the list of scenes to the graph viewer
        if (t.type != "theme") {
            HubClient.publishSceneCommand(list, connectionCache.getSocketID())
        } else {
            var scoreList = {
                "play": {
                    "themes": [],
                    "scenes": []
                }
            };
            scoreList.play.themes.push(t.name.toString());
            _.each(list, function (scene) {
                scoreList.play.scenes.push(scene.toString());
            });
            HubClient.publishScoreCommand(scoreList, connectionCache.getSocketID())
        }
    },
    setupRootNodes: function () {
        var self = this;
        var rootNodes = _.filter(self.state.data.nodes, function (node) {
            return node.type == 'root';
        });
        _.each(rootNodes, function (node) {
            node.cx = self.props.innerWidth / 2;
            node.cy = self.props.innerHeight / 2;
            node.color = "#c60c30";
            node.r = 90;
        })
    },
    setupSceneNodes: function () {
        var self = this;
        var sceneNodes = _.filter(self.state.data.nodes, function (node) {
            return node.type == 'scene';
        });
        _.each(sceneNodes, function (node, i) {
            var radian = ((2 * Math.PI) * i / sceneNodes.length) - 1.5708;
            node.cx = (Math.cos(radian) * self.props.innerHeight / 2) + self.props.innerWidth / 2;
            node._x = node.cx;
            node.cy = (Math.sin(radian) * self.props.innerHeight / 2) + self.props.innerHeight / 2;
            node._y = node.cy;
            node.color = "#0099b1";
            node.r = 60;

            _.each(node.parents, function (parent, i) {
                if (parent.type == "theme") {
                    parent.r = 30;
                    var radian = ((2 * Math.PI) * i / 6);
                    parent.cx = (Math.cos(radian) * self.props.innerHeight / 4) + node.cx;
                    parent.cy = (Math.sin(radian) * self.props.innerHeight / 4) + node.cy;
                    parent.color = "#c60c30";
                }
            })
        })
    },
    _nodes: function (list, sceneList) {

        for (var listIndex in list) {
            var thisItem = list[listIndex];

            if (thisItem.type !== 'scene') {
                nodes(thisItem.children, sceneList);
            } else {
                sceneList.push(thisItem._id);
            }
        }

        return sceneList;
    },
//Removes duplicates from the list of nodes.
    dedupeNodeList: function (list) {
        var dedupeList = [];

        for (var listIndex in list) {
            var item = list[listIndex];

            if (dedupeList.indexOf(item) === -1) {
                dedupeList.push(item);
            }
        }
        return dedupeList;
    },
    setupOtherNodes: function () {
        var self = this;
        var otherNodes = _.filter(self.state.data.nodes, function (node) {
            return node.type != 'scene' && node.type != 'root';
        });
        _.each(otherNodes, function (node) {
            node.cx = Math.random() * self.props.innerWidth;
            node.cy = Math.random() * self.props.innerHeight;
            node.color = "#c60c30";
        })
    },
    setupNodes: function () {
        var self = this;
        self.setupRootNodes();
        self.setupSceneNodes();
        /*        this.setupOtherNodes();*/
        var windowW = window.innerWidth * 0.1;
        var windowH = window.innerHeight * 0.2;
        var translate = 'translate(' + windowW + ',' + windowH + ')';
        var nodes = self.state.data.nodes.map((node, i) => {
            return (<g key={node._id} transform={translate}>
                <Circle data={node} eventHandler={self.tapHandler}></Circle>

                <Text data={node}></Text>
            </g>)
        });
        console.log("setup nodes triggered",nodes)
        return nodes;
    },
    render(){
        console.log("rendering",this.state.data)
        var nodeObjects = null;
        var linkObjects = null;
        if (this.state.data != null) {
            try {
                nodeObjects = this.setupNodes();
                linkObjects = this.state.data.links.map((link, i) => {
                    return (<Path data={link} key={i}></Path>);
                });
                console.log("links done as well",linkObjects)
            } catch (e) {
                console.log("error", e)
            }

        }


        var windowW = window.innerWidth * 0.1;
        var windowH = window.innerHeight * 0.2;
        var translate = 'translate(' + windowW + ',' + windowH + ')';
        return (

            <TransitionGroup ref="backgroundContainer" id="backgroundContainer" component="g">
                {/*transform="translate("{this.props.innerWidth * 0.1}","{this.props.innerHeight* 0.2}")"*/}
                <g id="nodeContainer" className="node-container">

                    <g id="edgeContainer" className="path-container" transform={translate}>
                        {/* link objects*/}
                        {linkObjects}
                    </g>

                    {/*node objects*/}
                    {nodeObjects}
                </g>

            </TransitionGroup>
        )
    }

});

module.exports = NarmGraph;
