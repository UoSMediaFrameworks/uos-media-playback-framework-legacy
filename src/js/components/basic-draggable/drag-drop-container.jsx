var React = require('react');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
var TreePositionLandingContainer = require('./tree-position-landing-container.jsx');
var LandingContainer = require('./landing-container.jsx');
var Item = require('./item.jsx');
var _ = require('lodash');

var ItemGroupForThemeUnion = React.createClass({
    render: function () {

        function renderItem(parent, property, sg, parentList) {

            var classNames = "firstLevel ";
            if (parent[property].type === 'city') {
                classNames += property;
            }

            if (parentList.length < 2) {
                classNames += " col-lg-4"; //If root nodes add into bootstrap column system.
            }

            //city is added to the class name to allow css hiding.  This is to ensure city logins do not have direct access to city nodes in the drag drop structure :: GDC 2016

            return (
                <div key={parent + "_" + property} className={classNames}>
                    <TreePositionLandingContainer indentation="rootLevel" parent={parent} parentList={parentList}
                                                  graphTheme={parent[property]} node={property} sceneGraph={sg}>
                        <ul className="graph-themes-list">
                            {Object.keys(parent[property].children).map(function (nestedProperty) {
                                var updatedParentList = _.clone(parentList);
                                updatedParentList.push(nestedProperty);
                                return renderItem(parent[property].children, nestedProperty, sg, updatedParentList);
                            }, this)}
                        </ul>
                    </TreePositionLandingContainer>
                </div>
            );

        }

        return (
            <div>
                <div className="col-md-6" style={{ overflow: 'hidden'}}>
                    <div className="panel panel-default scenes-themes-tags margin-top-34">
                        <div className="panel-heading">Theme Union</div>
                        <div className="panel-body row">
                            {this.props.themeUnion.map(function (theme) {
                                return <Item key={theme} name={theme} sceneGraph={this.props.sceneGraph}/>
                            }, this)}
                        </div>
                    </div>
                </div>

                <div className="col-md-6 scene-graph-theme-drag-containers"
                     style={{ overflow: 'hidden'}}>
                    <div className="panel panel-default scenes-themes-tags margin-top-34">
                        <div className="panel-heading">
                            Drag a theme here to exclude
                        </div>
                            <LandingContainer
                                sceneGraph={this.props.sceneGraph ? this.props.sceneGraph : {excludedThemes: []}}/>
                    </div>
                </div>

                <div className="col-md-12">
                    <h4>SceneGraph</h4>

                    <ul className="graph-themes-list" style={{paddingLeft:0}}>
                        { Object.keys(this.props.graphThemes.children || {}).map(function (property) {
                            var parentList = [property];
                            return renderItem(this.props.graphThemes.children, property, this.props.sceneGraph, parentList);
                        }, this)}
                    </ul>

                </div>
            </div>


        )
    }
});

module.exports = DragDropContext(HTML5Backend)(ItemGroupForThemeUnion);

