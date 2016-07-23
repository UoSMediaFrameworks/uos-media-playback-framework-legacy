var React = require('react');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
var TreePositionLandingContainer = require('./tree-position-landing-container.jsx');
var LandingContainer = require('./landing-container.jsx');
var Item = require('./item.jsx');
var _ = require('lodash');

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

var ItemGroupForThemeUnion = React.createClass({
    render: function() {

        function renderItem(parent, property, sg, parentList) {
            return (
                <div className="firstLevel">
                    <TreePositionLandingContainer indentation="rootLevel" parent={parent} parentList={parentList} graphTheme={parent[property]} node={property} sceneGraph={sg}>
                        <ul className="graph-themes-list">
                            {Object.keys(parent[property]).map(function(nestedProperty){
                                var updatedParentList = _.clone(parentList);
                                updatedParentList.push(nestedProperty);
                                return renderItem(parent[property], nestedProperty, sg, updatedParentList);
                            }, this)}
                        </ul>
                    </TreePositionLandingContainer>
                </div>
            );

        }

        return (
            <div>
                <div className="col-md-6 scene-graph-theme-drag-containers" style={{ border: 'solid green 1px', overflow: 'hidden'}}>
                    <h4>Theme Union</h4>
                    {this.props.themeUnion.map(function(theme){
                        return <Item name={theme} sceneGraph={this.props.sceneGraph}/>
                    }, this)}
                </div>

                <div className="col-md-6 scene-graph-theme-drag-containers" style={{ overflow: 'hidden'}}>
                    <LandingContainer sceneGraph={this.props.sceneGraph ? this.props.sceneGraph : {excludedThemes: []}}/>
                </div>

                <div className="col-md-12">
                    <h4>SceneGraph</h4>

                    <ul className="graph-themes-list">
                        { Object.keys(this.props.graphThemes || {}).map(function(property){
                            var parentList = [property];
                            return renderItem(this.props.graphThemes, property, this.props.sceneGraph, parentList);
                        }, this)}
                    </ul>

                </div>
            </div>


        )
    }
});

module.exports = DragDropContext(HTML5Backend)(ItemGroupForThemeUnion);


/*

 <ul>
 { Object.keys(this.props.graphThemes || {}).map(function(property){
 console.log("GraphThemesDragDropContainer render foreach: [property: " + property + "]", this.props.graphThemes[property]);
 return <TreePositionLandingContainer indentation="rootLevel" graphTheme={this.props.graphThemes[property]} node={property} sceneGraph={this.props.sceneGraph}>
 <ul>
 {Object.keys(this.props.graphThemes[property]).map(function(nestedProperty){
 console.log("GraphThemesDragDropContainer NESTED render foreach: [property: " + nestedProperty + "]", this.props.graphThemes[property][nestedProperty]);
 return <TreePositionLandingContainer indentation="firstLevel" graphTheme={this.props.graphThemes[property][nestedProperty]} node={nestedProperty} sceneGraph={this.props.sceneGraph} />
 }, this)}
 </ul>
 </TreePositionLandingContainer>
 }, this)}
 </ul>

 */
