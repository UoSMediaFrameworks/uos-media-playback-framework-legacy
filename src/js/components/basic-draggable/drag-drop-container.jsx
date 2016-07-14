var React = require('react');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

var LandingContainer = require('./landing-container.jsx');
var Item = require('./item.jsx');

var ItemGroup = React.createClass({
    render: function () {
        return (
            <div>
                <div className="col-md-6 scene-graph-theme-drag-containers" style={{ border: 'solid green 1px', overflow: 'hidden'}}>
                    <h4>Theme Union</h4>
                    <Item name='ThemeOne' />
                    <Item name='ThemeTwo' />
                    <Item name='ThemeThree' />
                </div>

                <div className="col-md-6 scene-graph-theme-drag-containers" style={{ overflow: 'hidden'}}>
                    <LandingContainer/>
                </div>
            </div>
        );
    }
});

module.exports = DragDropContext(HTML5Backend)(ItemGroup);
