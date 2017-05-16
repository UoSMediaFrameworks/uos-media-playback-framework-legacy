var React = require("react");
var d3 = require("d3");
var TransitionGroup = require('react-transition-group/TransitionGroup');
var SceneGraphListStore = require('../../stores/scene-graph-list-store.jsx');
var HubSendActions = require('../../actions/hub-send-actions');
var NarmGraph = require('./narm-graph.jsx');

var _ = require("lodash");
var GraphContainer = React.createClass({
    getInitialState: function() {
        return {
            graphId: null,
            sceneList: null,
            root: {
                nodes: [],
                links: []
            }
        }
    },
    _onChange: function () {
        this.setState({sceneList:SceneGraphListStore.getSceneGraphByID(this.state.graphId)});
        this._initialize();
    },

    _initialize(){
        var localRoot = {
            nodes: [],
            links: []
        };
        var circularRef = [];
        function processNodes(data) {
            data.forEach(function (obj) {
                obj.x = obj.y = 0;
                obj.cx = window.innerWidth / 2;
                obj.cy = window.innerHeight / 2;
                obj.r = 2;
                obj.children = [];
                obj.parents = [];
                obj.related = [];
                obj.color = 'white';
                obj.visible = true;
                obj.highlighted = false;
                localRoot.nodes.push(obj)
            })
        }
        function processsEdges() {
            //This function creates the relationships between the different nodes based on the data received.
            //For each node's parent relationship id's find th e parent object, and then push and object containing the source and target for that relationship.
            //
            localRoot.nodes.forEach(function (node) {
                node.parentRelationshipIds.forEach(function (parent) {
                    var parentObj = _.find(localRoot.nodes, function (obj) {
                        return obj._id == parent;
                    });
                    //if there is a parent push the edge/relationship
                    if (node != parentObj) {
                        if (parentObj != undefined) {
                            localRoot.links.push({source: parentObj, target: node, visible:true, highlighted:false});
                        }
                        // add the references to those object for later usage to the objects themselves.
                        parentObj.children.push(node);
                        node.parents.push(parentObj);
                    }
                })
            })
        }
        function removeBadRelationships() {
            _.each(localRoot.nodes, function (node) {
                _.each(node.children, function (child) {
                    var gat = _.include(child.children, node)
                    if (gat) {
                        circularRef.push({
                            duplicate: node,
                            node: child
                        })
                    }
                })
            });
            //console.log(circularRef)
            _.each(circularRef, function (o) {
                var _children = _.reject(o.node.children, function (child) {
                    return child._id == o.duplicate._id;
                });
                var _parents = _.reject(o.duplicate.parents, function (parent) {
                    return parent._id == o.node._id;
                });
                if (!(o.node.type == "root")) {
                    localRoot.links = _.reject(localRoot.links, function (link) {
                        return (link.source == o.node && link.target == o.duplicate);
                    });
                }


                o.duplicate.parents = _parents;
                o.node.children = _children;


            });
        }
        processNodes(this.state.sceneList.nodeList);
        processsEdges();
        removeBadRelationships();
        console.log("initialized")
        this.setState({root:localRoot});
    },
    _getGraphTypeComponent(){

    },
    getQueryVariable(){
        return this.props.location.query.id
    },
    componentDidMount: function () {
        SceneGraphListStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function () {
        SceneGraphListStore.removeChangeListener(this._onChange);
    },
    componentWillMount(){
        var queryId = this.props.location.query.id || "589b24e6c9d9c9b81328d7e8";
        var graphId;
        if(queryId == undefined){
            graphId = "589b24e6c9d9c9b81328d7e8";
        }else{
            graphId= queryId;
        }
        HubSendActions.getSceneGraphByID(graphId);
        this.setState({graphId:graphId})
    },
    render(){

        var graphType="narm";
        return (
            <div ref="parent">

                <div className="button-wrapper btn-group-vertical" >
                    <button className="btn graph-btn" id="reset-origin">Go Home</button>
                </div>

                <div ref="graph">
                    <svg viewBox={"0 0 " + window.innerWidth + " " + window.innerHeight } preserveAspectRatio="xMinYMin" className={graphType}>
                        <NarmGraph
                            data={this.state.root}
                            innerWidth={window.innerWidth * 0.8}
                            innerHeight={window.innerHeight * 0.6}
                        />
                    </svg>
                </div>

                {/*OPTIONS Menu Item here*/}
                {/*Autowalk Item here*/}
                {/*Crumbs Container here*/}
                <div className={graphType+"-logo"}>
                    <img src="http://www.salford.ac.uk/__data/assets/image/0005/906287/university-of-salford-web-logo-clear-back-113x70.png"/>
                </div>
                <div className={graphType+"-logo2"}>
                    <img src="http://salfordmediafestival.co.uk/wp-content/uploads/2014/06/media_conference.png"/>
                </div>
                {/*Optional Logos Here*/}

            </div>
        );
    }
});

module.exports = GraphContainer;


