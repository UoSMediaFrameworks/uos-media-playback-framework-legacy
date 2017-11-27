var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var Circle = require("./narm-components/circle.jsx");
var Text = require("./narm-components/text.jsx");
var Path = require("./narm-components/path.jsx");
var _ = require("lodash");
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');
var GraphBreadcrumbActions =require("../../actions/graph-breadcrumb-actions");
var AutowalkStore = require('../../stores/autowalk-store.js');


var _autowalkHandlerInterval = null;
var _playRandomNodeInterval = null;
var CeramicGraph = React.createClass({

    getInitialState: function () {
        return {data: null}
    },
    componentWillMount: function () {
        if(this.props.data.nodes){
            this.setupNodes(this.props.data,this.props)
        };
         console.log(this.props)
        /*  this.setState({data:this.props.data})*/
    },
    componentWillReceiveProps: function (nextProps) {
        if(nextProps.shouldUpdateId != this.props.shouldUpdateId){
            console.log("update",nextProps)
            this.setupNodes(nextProps.data,nextProps)
        }

    },
    componentDidMount: function () {
        document.addEventListener('keyup', this.optionsMenuHandler, false);
        BreadcrumbsStore.addPlayListener(this._playBreadcrumbs);
        BreadcrumbsStore.addTraceListener(this._traceBreadcrumbs);
        AutowalkStore.addChangeListener(this._autowalkHandler);
    },

    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.optionsMenuHandler, false);
        BreadcrumbsStore.removePlayListener(this._playBreadcrumbs);
        BreadcrumbsStore.removeTraceListener(this._traceBreadcrumbs);
        AutowalkStore.removeChangeListener(this._autowalkHandler);
    },
    _autowalkHandler: function (props) {
        var self = this;
        clearTimeout(_autowalkHandlerInterval);
        clearTimeout(_playRandomNodeInterval);
        if (props.enabled) {

            _autowalkHandlerInterval = setTimeout(function () {
                self._playRandomNode(props.node_switch_duration)
            }, props.inactivity_wait_duration)
        }
    },
    _playRandomNode: function (switchTime) {
        var self=this;

        if (_playRandomNodeInterval) {
            clearTimeout(_playRandomNodeInterval);
        }
        _playRandomNodeInterval = setInterval(function () {
            var i = self.getRandomInt(0, self.state.data.nodes.length);
            self.tapHandler(self.state.data.nodes[i]);
        }, switchTime)
    },
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    _playBreadcrumbs: function (crumbs) {
        var self = this;

        var time = 1000;
        _.each(crumbs.breadcrumbs, function (crumb, i) {
            //console.log(time, value.difference);
            time += crumb.diff;
            setTimeout(function () {
                var data = _.find(self.state.data.nodes, function (obj) {
                    return obj._id == crumb.node;
                });
                if (crumb.event == "tap") {
                    self.tapHandler(data);
                }
            }, time);
        });
    },
    _traceBreadcrumbs: function (breadcrumb) {

        var self =this;
        var crumbs = breadcrumb.breadcrumbs;
        self.removeHighlights();
        for (var i = 0; i < (crumbs.length-1); i++) {
            var links = _.filter(self.state.data.links, function (link) {
                var link1 = link.source._id == crumbs[i].node && link.target._id == crumbs[i + 1].node
                var link2 = link.source._id == crumbs[i+1].node && link.target._id == crumbs[i].node
                return link1 || link2 ;
            });
            if(links[0] != undefined){
                links[0].highlighted=true;
            }
        }
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
        var recording = BreadcrumbsStore.getRecording();
        if(recording){
            GraphBreadcrumbActions.addCrumb("tap",t.name)
        }
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
    setupRootNodes: function (data,p) {
        var rootNodes = _.filter(data.nodes, function (node) {
            return node.type == 'root';
        });
        _.each(rootNodes, function (node) {
            node.cx =  p.innerWidth / 2;
            node.cy = p.innerHeight / 2;
            node.r = 50;
            node.color = "black"
        })
    },
    setupSceneNodes: function (data,p) {
        var self= this;
        var sceneNodes = _.filter(data.nodes, function (node) {
            return node.type == 'scene';
        });
        _.each(sceneNodes, function (node, i) {
            node.cx = Math.random() * self.props.innerWidth;
            node.cy = Math.random() * self.props.innerHeight;
            node.color = "blue";
        })
    },
    setupThemeNodes:function (data,p){
        var self= this;
        var themeNodes = _.filter(data.nodes, function (node) {
            return node.type == 'theme';
        });
        _.each(themeNodes, function (node, i) {
            node.cx = Math.random() * self.props.innerWidth;
            node.cy = Math.random() * self.props.innerHeight;
            node.color = "red";
        })
    },
    setupSThemeNodes:function(data,p){
        var self= this;
        var sthemeNodes = _.filter(data.nodes, function (node) {
            return node.type == 'subgraphtheme';
        });
        _.each(sthemeNodes, function (node, i) {
            node.cx = Math.random() * self.props.innerWidth;
            node.cy = Math.random() * self.props.innerHeight;
            node.color = "yellow";
        })
    },
    _nodes: function (list, sceneList) {
        var self = this;
        for (var listIndex in list) {
            var thisItem = list[listIndex];

            if (thisItem.type !== 'scene') {
                self._nodes(thisItem.children, sceneList);
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
    setupOtherNodes: function (data,p) {
        var self = this;

        _.each(data.nodes, function (node) {
          node.r =15;
        })
    },
    setupNodes: function (data, properties) {
        var self = this;
        self.setupRootNodes(data, properties);
        self.setupSceneNodes(data, properties);
        self.setupSThemeNodes(data,properties);
        self.setupThemeNodes(data,properties);
        self.setupOtherNodes(data,properties);
        self.setState({data:data});
    },
    render(){
        console.log("ceramic", this)
        var windowW = this.props.innerWidth * 0.1;
        var windowH = this.props.innerHeight * 0.2;
        var self = this;
        var nodes = this.state.data.nodes.map((node, i) => {
            return (<g key={i} >
                <Circle data={node} eventHandler={self.tapHandler}></Circle>

                <Text data={node}></Text>
            </g>)
        });
        var links = this.state.data.links.map((link, i) => {
            return (<Path data={link} key={i} innerW={self.props.innerWidth} innerH={self.props.innerHeight}></Path>);
        });

        var translate = 'translate(' + windowW + ',' + windowH + ')';
        return (

            <TransitionGroup ref="backgroundContainer" id="backgroundContainer" component="g">
                {/*transform="translate("{this.props.innerWidth * 0.1}","{this.props.innerHeight* 0.2}")"*/}
                <g id="nodeContainer" className="node-container" transform={translate}>

                    <g id="edgeContainer" className="path-container" >
                        {/* link objects*/}
                        {links}
                    </g>

                    {/*node objects*/}
                    {nodes}
                </g>

            </TransitionGroup>
        )
    }

});

module.exports = CeramicGraph;
