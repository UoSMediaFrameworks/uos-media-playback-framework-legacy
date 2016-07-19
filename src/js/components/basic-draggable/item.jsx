var React = require('react');
var PropTypes = React.PropTypes;
var ItemTypes = require('../draggable/item-types.jsx').ItemTypes;

var DragSource = require('react-dnd').DragSource;

var itemSource = {
    beginDrag: function(props) {
        console.log("Begin drag: ", props);
        return {
            name: props.name
        };
    },
    endDrag: function(props, monitor) {
        var item = monitor.getItem();
        var dropResult = monitor.getDropResult();

        console.log("end drag");
        console.log(item);
        console.log(dropResult);
        
        if (dropResult) {
            console.log("DROP SUCCESS");
        }

        console.log("DROP FAIL");
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
};

var Item = React.createClass({
    propTypes: {
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired
    },

    render: function () {
        var isDragging = this.props.isDragging;
        var connectDragSource = this.props.connectDragSource;
        var name = this.props.name;
        var opacity = isDragging ? 0.4 : 1;

        return (
            connectDragSource(
                <div style={{opacity}}>
                    {name}
                </div>
            )
        );
    }

});


module.exports = DragSource(ItemTypes.LANDING_CONTAINER, itemSource, collect)(Item);
