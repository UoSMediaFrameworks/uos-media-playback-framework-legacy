var React = require('react');
var PropTypes = React.PropTypes;
var ItemTypes = require('../draggable/item-types.jsx').ItemTypes;
var DragSource = require('react-dnd').DragSource;
var SceneGraphActions = require('../../actions/scene-graph-actions');

var itemSource = {
    beginDrag: function(props) {
        console.log("Begin drag: ", props);
        return {
            name: props.name,
            sceneGraph: props.sceneGraph
        };
    },
    endDrag: function(props, monitor) {
        var item = monitor.getItem();
        var dropResult = monitor.getDropResult();

        console.log("end drag - item, dropResult", {
            item: item,
            dropResult: dropResult
        });

        if(!dropResult){
            return;
        }

        if (dropResult.name !== 'scene-graph-drop-target') {
            SceneGraphActions.excludeTheme(item.name, item.sceneGraph._id);
        } else if (dropResult.name === 'scene-graph-drop-target') {
            console.log("DROPPED INTO THE HIERARCHY: ", dropResult);

            var dropData = dropResult.props;
            var dropParentList = dropData.parentList;
            var dropParentKey = dropData.node;
            var dropSceneGraphId = dropData.sceneGraph._id;
            var dropParentType = dropData.graphTheme.type;
            var themeId = item.name;
            SceneGraphActions.addThemeIntoSceneGraph(dropParentList, dropParentKey, themeId, dropSceneGraphId, dropParentType);

        }
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
                <div style={{opacity}} className="col-lg-6">
                    {name}
                </div>
            )
        );
    }

});


module.exports = DragSource(ItemTypes.LANDING_CONTAINER, itemSource, collect)(Item);
