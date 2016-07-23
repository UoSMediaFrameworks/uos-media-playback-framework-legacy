var React = require('react');
var PropTypes = React.PropTypes;
var ItemTypes = require('../draggable/item-types.jsx').ItemTypes;
var DropTarget = require('react-dnd').DropTarget;


var landingContainerTarget = {

    drop: function(props, monitor, component) {

        var hasDroppedOnChild = monitor.didDrop();
        var hasDropResult = monitor.getDropResult();

        console.log("hasDroppedOnChild, hasDropResult", {
            hasDroppedOnChild: hasDroppedOnChild,
            hasDropResult: hasDropResult
        });

        if (hasDroppedOnChild) {
            console.log("HASDROPPEDONCHILD");
            return;
        }

        return {
            name: 'scene-graph-drop-target',
            props: props
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
    }
};

var TreePositionLandingContainer = React.createClass({
    propTypes: {
        connectDropTarget: PropTypes.func.isRequired,
        isOver: PropTypes.bool.isRequired,
        isOverCurrent: PropTypes.bool.isRequired,
        children: PropTypes.node
    },

    render: function () {
        var connectDropTarget = this.props.connectDropTarget;
        var isOver = this.props.isOver;
        var isOverCurrent = this.props.isOverCurrent;
        var children = this.props.children;
        var backgroundColor = '#222';
        if (isOverCurrent) {
            backgroundColor = 'darkgreen';
        }

        return connectDropTarget(
            <li style={{
                minHeight: '50px',
                width: '100%',
                borderColor: backgroundColor,
                borderStyle: 'solid',
                borderWidth: '2px'
            }} className={this.props.indentation}>
                <p> {this.props.node} </p>
                {children}
            </li>
        );
    }

});


module.exports = DropTarget(ItemTypes.LANDING_CONTAINER, landingContainerTarget, collect)(TreePositionLandingContainer);

/*
 <ul>
 { Object.keys(this.props.graphTheme).map(function(property){
 return <TreePositionLandingContainer indentation="firstLevel" graphTheme={this.props.graphTheme[property]} node={property} sceneGraph={this.props.sceneGraph}/>
 }, this)}
 </ul>
 */
//connectDropTarget={connectDropTarget} isOver={isOver}
