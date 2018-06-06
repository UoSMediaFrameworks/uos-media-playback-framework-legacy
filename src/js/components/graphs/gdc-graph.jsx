var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var Circle = require("./gdc-components/circle.jsx");
var Path = require("./gdc-components/path.jsx");
var Text = require("./gdc-components/text.jsx")

var _ = require("lodash");
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");
var AutocompleteStore = require('../../stores/autocomplete-store');
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');
var GraphBreadcrumbActions = require("../../actions/graph-breadcrumb-actions");
var AutowalkStore = require('../../stores/autowalk-store.js');

var cityColors = [
    [255, 0, 0],
    [253, 95, 0],
    [255, 129, 0],
    [255, 231, 64],
    [13, 59, 108],
    [0, 77, 170],
    [0, 135, 253],
    [36, 203, 254],
    [143, 196, 31],
    [198, 235, 116]
];
var _autowalkHandlerInterval = null;
var _playRandomNodeInterval = null;
var overlappingElementsCounter = 0;

var GDCGraph = React.createClass({

    getInitialState: function () {
        return {data: null, title: ""}
    },


    componentWillMount: function () {
        this.setupNodes(this.props.data, this.props)
    },
    componentWillReceiveProps: function (nextProps) {

        if (nextProps.shouldUpdateId !== this.props.shouldUpdateId)
        {
            this.setupNodes(nextProps.data, nextProps)
        }

    },
    componentDidMount: function () {
        document.addEventListener('keyup', this.optionsMenuHandler, false);
        BreadcrumbsStore.addPlayListener(this._playBreadcrumbs);
        BreadcrumbsStore.addTraceListener(this._traceBreadcrumbs);
        AutowalkStore.addChangeListener(this._autowalkHandler);
        AutocompleteStore.addChangeListener(this._playAutocompleteNode);
    },
    _playAutocompleteNode:function(value){
        var self =this;
        console.log(value)
        if(value && value!== "none"){
            var data = _.find(self.state.data.nodes, function (obj) {
                return obj._id === value;
            });
            if(data){
                self.contextualizeHandler(data)
            }
        }
    },
    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.optionsMenuHandler, false)
        BreadcrumbsStore.removePlayListener(this._playBreadcrumbs);
        BreadcrumbsStore.removeTraceListener(this._traceBreadcrumbs);
        AutowalkStore.removeChangeListener(this._autowalkHandler);
        AutocompleteStore.removeChangeListener(this._playAutocompleteNode);
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
        var self = this;

        if (_playRandomNodeInterval) {
            clearTimeout(_playRandomNodeInterval);
        }
        _playRandomNodeInterval = setInterval(function () {
            var i = self.getRandomInt(0, self.state.data.nodes.length);
            self.contextualizeHandler(self.state.data.nodes[i]);
        }, switchTime)
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
                } else if (crumb.event == "contextualize") {
                    self.contextualizeHandler(data);
                }
            }, time);
        });
    },
    _traceBreadcrumbs: function (breadcrumb) {

        var self = this;
        var crumbs = breadcrumb.breadcrumbs;
        self.removeHighlights();
        for (var i = 0; i < (crumbs.length - 1); i++) {
            var links = _.filter(self.state.data.links, function (link) {
                var link1 = link.source._id == crumbs[i].node && link.target._id == crumbs[i + 1].node
                var link2 = link.source._id == crumbs[i + 1].node && link.target._id == crumbs[i].node
                return link1 || link2;
            });
            if (links[0] != undefined) {
                links[0].highlighted = true;
            }
        }
    },
    _distance: function (a, b) {
        var self = this;
        var dx, dy;
        //console.log(a.r, b.r)
        if (b.type == 'city' || b.type == 'root') {
            dx = b.cx - a.cx;
            dy = b.cy - a.cy;
        } else {
            dx = a.cx - b.cx;
            dy = a.cy - b.cy;
        }
        var separation = Math.sqrt(dx * dx + dy * dy) - (a.r + b.r);

        var angleRadianA = Math.atan2(a.cy - b.cy, a.cx - b.cx);
        var angleRadianB = Math.atan2(b.cy - a.cy, b.cx - a.cx);

        if (separation < 10) {
            overlappingElementsCounter++;
            if (b.type == 'city' || b.type == 'root') {

                var x = Math.floor((Math.cos(angleRadianA) * (b.r + separation)) + a.cx);
                var y = Math.floor((Math.sin(angleRadianA) * (b.r + separation)) + a.cy);
                self.moveNode(a, x, y, "optimize", a.r);
            } else {
                //console.log("A:type", a.name)
                var x = Math.floor((Math.cos(angleRadianB) * (a.r + separation)) + b.cx);
                var y = Math.floor((Math.sin(angleRadianB) * (a.r + separation)) + b.cy);
                //An alternative function to move node will be added this is a placeholder
                self.moveNode(b, x, y, "optimize", b.r);
            }
        }
    },
    resetToOrigin: function () {
        var self = this;
        _.each(self.state.data.nodes, function (node) {
            node.cx = node._x;
            node.cy = node._y;
            node.r = node._r;
        })
    },
    resetHandler: function () {
        this.resetToOrigin();
        this.setState({title: "", data: this.state.data})
    },
    compareElements: function (array) {
        overlappingElementsCounter = 0;
        var self = this;
        for (var i = 0; i < array.length; i++) {
            for (var k = i + 1; k < array.length; k++) {
                if (array[k] == array[i]) {
                    break;
                } else {
                    self._distance(array[i], array[k]);
                }
            }
        }
    },
    clearOverlap: function (data) {
        var self = this;
        overlappingElementsCounter++;
        while (overlappingElementsCounter > 0) {
            this.compareElements(data.nodes);
        }
    },
    removeHighlights: function () {
        var self = this;
        _.each(self.state.data.nodes, function (node) {
            node.highlighted = false;
            node.textHighlighted = false;
        });
        _.each(self.state.data.links, function (link) {
            link.highlighted = false;
        });
    },
    highlight: function (data) {
        var self = this;
        var filteredEdges;
        self.removeHighlights();
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
            node.textHighlighted = true;
        });
        var links = _.filter(filteredEdges, function (item) {
            return item.source == data || item.target == data;
        });
        _.each(links, function (link) {
            link.highlighted = true;
        });
        this.setState({data: self.state.data});
    },
    clusterHighlight: function (data) {
        var self = this;
        self.removeHighlights();
        var filteredEdges;
        if (data.type == 'root') {
            filteredEdges = _.filter(self.state.data.links, function (item) {
                return item.source.type == 'subgraphtheme' || item.target.type == 'subgraphtheme';
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
        node.textHighlighted = true;
        var links = _.filter(filteredEdges, function (item) {
            return item.source == data || item.target == data;
        });
        _.each(links, function (link) {
            link.highlighted = true;
            link.source.textHighlighted=true;
            link.target.textHighlighted=true;
        })
    },
    contextualizeHandler(t) {

        var recording = BreadcrumbsStore.getRecording();
        if (recording) {
            GraphBreadcrumbActions.addCrumb("contextualize", t._id)
        }
        try {
            this.resetToOrigin();
            this.clusterNodes(t);
            this.clusterHighlight(t);
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
            this.props.titleHandler(t.name)
            this.setState({data: this.state.data});
        } catch (e) {
            console.log(e)
        }


    },
    pluckArray(array) {
        var index = this.getRandomInt(0, array.length);
        //console.log('Rand index ' + index)
        var obj = array[index];
        //console.log(obj)
        array = array.splice(index, 1);
        return obj;
    },
    clusterNodes(node) {
        var self = this;
        node.r = 15;
        node.related = _.union(node.children, node.parents);
        var radius = this.props.innerHeight / 5;
        var clusterArray = [];
        if (node.type == "root") {
            var filteredEdges = _.filter(node.related, function (item) {
                return item.type == "subgraphtheme";
            });
        }
        else {
            var filteredEdges = _.filter(node.related, function (item) {
                return item.type != "root" && item.type != "city";
            });
        }
        while (clusterArray.length < 12) {
            var localNode = this.pluckArray(filteredEdges);
            if (localNode == undefined && filteredEdges.length == 0) {
                break;
            } else if (localNode == undefined && filteredEdges.length > 0) {
                console.log("node not found")
            } else {
                clusterArray.push(localNode)
            }
        }
        var total = clusterArray.length;
        _.each(clusterArray, function (child, index) {
            var radian = (2 * Math.PI) * (index / total);
            var x = (Math.cos(radian) * radius) + node.cx;
            var y = (Math.sin(radian) * radius) + node.cy;
            var refference = _.find(self.state.data.nodes, function (d) {
                return d == child;
            });
            refference.highlighted = true;
            self.moveNode(refference, x, y, "null", 15);
        });
    },
    moveNode(node, x, y, interactionType, radius) {
        var ratio = 1 - Math.pow(1 / 5000, 5);
        if (ratio => 1) {
            node.cx = x;
            node.cy = y;
        } else {
            node.cx = ratio * (x - node.cx) + node.cx;
            node.cy = ratio * (y - node.cy) + node.cy;
        }
        if (interactionType == "optimize") {
            node._x = node.cx;
            node._y = node.cy;
        }
        node.r = radius;
    },
    tapHandler(t) {
        var recording = BreadcrumbsStore.getRecording();
        if (recording) {
            GraphBreadcrumbActions.addCrumb("tap", t._id)
        }
        this.highlight(t);
    },
    setupRootNodes: function (data,p) {
        var self = this;
        var rootNodes = _.filter(data.nodes, function (node) {
            return node.type == 'root';
        });
        var length = rootNodes.length;
        _.each(rootNodes, function (node, i) {
            node.cx = ((p.innerWidth / length) / 2) * i +p.innerWidth / length;
            node._x = node.cx;
            node.cy = p.innerHeight / 2;
            node._y = node.cy;
            node.color = "url(#radial-gradient)";
            node._r = node.r = 18;
        })
    },
    setupCityNodes: function (data,p) {
        var self = this;
        var cityNodes = _.filter(data.nodes, function (node) {
            return node.type == 'city';
        });
        var angle = (2 * Math.PI) / cityNodes.length;
        _.each(cityNodes, function (node, i) {
            node.cx = (Math.cos(angle * i) * p.innerWidth / 2) + p.innerWidth / 2;
            node._x = node.cx;
            node.cy = (Math.sin(angle * i) * p.innerHeight / 2) + p.innerHeight / 2;
            node._y = node.cy;
            try {
                node.color = d3.rgb(cityColors[i][0], cityColors[i][1], cityColors[i][2]);
            } catch (e) {
                node.color = "black"
            }

            node._r = node.r = 16;

        });
    },
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    setupGThemeNodes: function (data) {
        var self = this;
        var gThemeNodes = _.filter(data.nodes, function (node) {
            return node.type == 'subgraphtheme';
        });
        _.each(gThemeNodes, function (node) {
            node._r = node.r = self.getRandomInt(6, 7);
            node.color = d3.rgb(111, 115, 125);
        })
    },
    setupSThemeNodes: function (data) {
        var self = this;
        var sThemeNodes = _.filter(data.nodes, function (node) {
            return node.type == 'theme';
        });
        _.each(sThemeNodes, function (node) {
            var cityParent = _.find(node.parents, function (item) {
                return item.type == "city";
            });
            if (cityParent != undefined) {
                node.color = cityParent.color;
            } else {
                node.color = "white";
            }
            node._r = node.r = self.getRandomInt(5, 6);
        });
    },
    setupSceneNodes: function (data) {
        var self = this;
        var sceneNodes = _.filter(data.nodes, function (node) {
            return node.type == 'scene';
        });

        _.each(sceneNodes, function (node, i) {
            node.color = "yellow";
            node._r = node.r = self.getRandomInt(4, 5);
        })
    },
    setupOtherNodes: function (data, w, h,p) {
        var self = this;
        var otherNodes = _.filter(data.nodes, function (node) {
            return node.type != 'city' && node.type != 'root';
        });

        _.each(otherNodes, function (node) {
            node.cx = (Math.random() * p.fullWidth) - w;
            node.cy = (Math.random() * p.fullHeight) - h;
            node._x = node.cx;
            node._y = node.cy;
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
    setupNodes: function (data, properties) {
        var self = this;
        var windowW = properties.fullWidth * 0.1;
        var windowH = properties.fullHeight * 0.2;
        self.setupRootNodes(data,properties);
        self.setupCityNodes(data,properties);
        self.setupGThemeNodes(data,properties);
        self.setupSThemeNodes(data,properties);
        self.setupSceneNodes(data,properties);
        self.setupOtherNodes(data, windowW, windowH,properties);
        /*     self.clearOverlap(data);*/
        self.setState({data: data});
    },
    render() {
        var self = this;
        var windowW = self.props.fullWidth * 0.1;
        var windowH = self.props.fullHeight * 0.2;
        var translate = 'translate(' + windowW + ',' + windowH + ')';
        var nodes = self.state.data.nodes.map((node, i) => {

            return (<g key={i}>
                <Circle data={node} clickHandler={self.tapHandler} dblClickHandler={self.contextualizeHandler}></Circle>

                <Text data={node}></Text>
            </g>)
        });
        var links = self.state.data.links.map((link, i) => {
            return (<Path data={link} key={i} innerH={self.props.innerHeight}
                          innerW={self.props.innerWidth}></Path>);
        });

        return (

            <TransitionGroup ref="backgroundContainer" id="backgroundContainer" component="g">
                <defs>
                    <radialGradient id="radial-gradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8f8f8f"></stop>
                        <stop offset="50%" stopColor="#bdbdbd"></stop>
                        <stop offset="90%" stopColor="#ebebeb"></stop>
                        <stop offset="100%" stopColor="#FFFFFF"></stop>
                    </radialGradient>
                    <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#000000" strokeWidth="1"></path>
                    </pattern>
                </defs>

                <g id="nodeContainer" className="node-container" transform={translate}>
                    {/*{self.state.title}*/}
                    <g id="edgeContainer" className="path-container">
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

module.exports = GDCGraph;
