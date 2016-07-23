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

var _collapsed = true;

var TreePositionLandingContainer = React.createClass({
    propTypes: {
        connectDropTarget: PropTypes.func.isRequired,
        isOver: PropTypes.bool.isRequired,
        isOverCurrent: PropTypes.bool.isRequired,
        children: PropTypes.node
    },

    getInitialState: function() {
        return {
            _collapsed: _collapsed
        }
    },

    handleToggleCollapse: function(event) {
        _collapsed = !_collapsed;

        this.setState({_collapsed: _collapsed});
    },

    render: function () {
        var connectDropTarget = this.props.connectDropTarget;
        var isOver = this.props.isOver;
        var isOverCurrent = this.props.isOverCurrent;
        var children = this.props.children;
        var backgroundColor = '#EEEEEE';
        if (isOverCurrent) {
            backgroundColor = '#388E3C';
        }

        var classNames = '' + this.props.indentation + ' ';

        var dropDownClassNames = 'glyphicon glyphicon-hand-up collapse-icon';
        var dropUpClassNames = 'glyphicon glyphicon-hand-down collapse-icon';
        var iconClassNames = dropUpClassNames;

        if(this.state._collapsed) {
            classNames += ' collapsed-container';
            iconClassNames = dropDownClassNames;
        }

        return connectDropTarget(
            <li style={{
                minHeight: '30px',
                width: '100%',
                borderColor: backgroundColor,
                borderStyle: 'dotted',
                borderWidth: '1px'
            }} className={classNames}>
                <span className={iconClassNames}  aria-hidden="true"
                      onClick={this.handleToggleCollapse}></span>
                <span className="node-name"> {this.props.node} </span>
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
