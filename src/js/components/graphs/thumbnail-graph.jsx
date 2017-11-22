var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var Rectangle = require("./thumbnail-components/rectangle.jsx");
var Path = require("./thumbnail-components/path.jsx");
var _ = require("lodash");
var connectionCache = require("../../utils/connection-cache");
var HubClient = require("../../utils/HubClient");
var BreadcrumbsStore = require('../../stores/breadcrumbs-store');
var GraphBreadcrumbActions =require("../../actions/graph-breadcrumb-actions");
var AutowalkStore = require('../../stores/autowalk-store.js');
var _autowalkHandlerInterval = null;
var _playRandomNodeInterval = null;

var ThumbGraph = React.createClass({

     randomColor :function(){
        var golden_ratio_conjugate = 0.618033988749895;
        var h = Math.random();

        var hslToRgb = function (h, s, l){
            var r, g, b;

            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
        };
         h += golden_ratio_conjugate;
         h %= 1;

         return hslToRgb(h, 0.5, 0.60);

    },
    getInitialState: function () {
        return {data: null}
    },
    componentWillMount: function () {

        this.setupNodes(this.props.data,this.props)
        /*  this.setState({data:this.props.data})*/
    },
    componentWillReceiveProps: function (nextProps) {
        if(nextProps.shouldUpdateId != this.props.shouldUpdateId){
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
        AutowalkStore.removeTraceListener(this._autowalkHandler);
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
    setupRootNodes: function (data,p) {
         var self = this;
        var rootNodes = _.filter(data.nodes, function (node) {
            return node.type == 'root';
        });
        _.each(rootNodes, function (node) {
            node.x =  p.innerWidth / 2 - node.width/2;
            node.y = p.innerHeight / 2 - node.height/2;
            node.color = self.randomColor();
        })
    },
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    setupSceneNodes: function (data,p) {
         var self = this;
        var sceneNodes = _.filter(data.nodes, function (node) {
            return node.type != 'root';
        });
        _.each(sceneNodes, function (node, i) {
            node.x = (Math.random() * p.innerWidth);
            node.y = (Math.random() * p.innerHeight);
            node._x = node.x;
            node._y = node.y;
            node.color = self.randomColor();
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
    setupNodes: function (data, properties) {
        var self = this;
        try{
            self.setupRootNodes(data, properties);
            self.setupSceneNodes(data, properties);
            console.log("THUMB",data,properties);
            self.setState({data:data});
        }catch(ex){
            console.log("SetupNode Err",ex)
        }

    },
    render(){
        var windowW = this.props.innerWidth * 0.1;
        var windowH = this.props.innerHeight * 0.2;
        var self = this;

        try{
            var nodes = this.state.data.nodes.map((node, i) => {
                return (<g key={i} >
                    <Rectangle data={node} eventHandler={self.tapHandler}></Rectangle>
                </g>)
            });
            var links = this.state.data.links.map((link, i) => {
                return (<Path data={link} key={i} innerW={self.props.innerWidth} innerH={self.props.innerHeight}></Path>);
            });
            console.log("render succ", this.props)

        }
        catch(ex){
            console.log("render fail", ex);
        }

        console.log();
        var translate = 'translate(' + windowW + ',' + windowH + ')';
        return (

            <TransitionGroup ref="backgroundContainer" id="backgroundContainer" component="g">
                {/*transform="translate("{this.props.innerWidth * 0.1}","{this.props.innerHeight* 0.2}")"*/}
                <g id="nodeContainer" className="node-container" transform={translate}>

                  {/*  <g id="edgeContainer" className="path-container" >
                         link objects
                        {links}
                    </g>*/}

                    {/*node objects*/}
                    {nodes}
                </g>

            </TransitionGroup>
        )
    }
});

module.exports = ThumbGraph;
