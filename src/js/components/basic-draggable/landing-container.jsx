var React = require('react');
var PropTypes = React.PropTypes;
var ItemTypes = require('../draggable/item-types.jsx').ItemTypes;
var DropTarget = require('react-dnd').DropTarget;
var SceneGraphActions = require('../../actions/scene-graph-actions');
var hat = require("hat");
var landingContainerTarget = {
    drop: function () {
        return {name: 'drop-target'}
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
};

var ExcludedTheme = React.createClass({

    removeExcludedTheme: function (event) {
        SceneGraphActions.includeTheme(this.props.excludedTheme, this.props.sceneGraph._id);
    },

    render: function () {
        return (
            <div>
                {this.props.excludedTheme}
                <span className="glyphicon glyphicon-remove" onClick={this.removeExcludedTheme}></span>
            </div>
        )
    }
});

var LandingContainer = React.createClass({
    propTypes: {
        connectDropTarget: PropTypes.func.isRequired,
        isOver: PropTypes.bool.isRequired,
        canDrop: PropTypes.bool.isRequired
    },

    render: function () {
        var connectDropTarget = this.props.connectDropTarget;
        var isOver = this.props.isOver;
        var canDrop = this.props.canDrop;
        var isActive = canDrop && isOver;

        var backgroundColor = 'black';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'darkgreen';
        }

        var sceneGraph = this.props.sceneGraph;
        var excludedThemes = Object.keys(sceneGraph.excludedThemes);

        return connectDropTarget(
            <div className="panel-body" style={{
                width: '100%',
                paddingLeft: '15px',
                paddingRight: '15px'
            }}>

                {excludedThemes.map(function (excludedTheme) {
                    var key = hat();
                    return <ExcludedTheme key={key} excludedTheme={excludedTheme} sceneGraph={sceneGraph}></ExcludedTheme>
                })}
            </div>
        );
    }

});


module.exports = DropTarget(ItemTypes.LANDING_CONTAINER, landingContainerTarget, collect)(LandingContainer);
