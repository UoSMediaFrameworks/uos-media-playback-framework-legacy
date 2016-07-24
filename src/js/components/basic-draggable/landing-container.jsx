var React = require('react');
var PropTypes = React.PropTypes;
var ItemTypes = require('../draggable/item-types.jsx').ItemTypes;
var DropTarget = require('react-dnd').DropTarget;


var landingContainerTarget = {
    drop: function() {
        return { name: 'drop-target' }
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
};

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

        var backgroundColor = '#222';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'darkkhaki';
        }

        var sceneGraph = this.props.sceneGraph;
        var excludedThemes = Object.keys(sceneGraph.excludedThemes);

        return connectDropTarget(
            <div style={{
                minHeight: '200px',
                width: '100%',
                borderColor: backgroundColor,
                borderStyle: 'solid',
                borderWidth: '1px',
                paddingLeft: '15px',
                paddingRight: '15px'
            }}>
                <h4>
                    {isActive ?
                        'Release to drop' :
                        'Drag a theme here to exclude'
                    }
                </h4>

                {excludedThemes.map(function(excludedTheme){
                    return <div>{excludedTheme}</div>
                })}
            </div>
        );
    }

});


module.exports = DropTarget(ItemTypes.LANDING_CONTAINER, landingContainerTarget, collect)(LandingContainer);
