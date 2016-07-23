var React = require('react');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
var TreePositionLandingContainer = require('./tree-position-landing-container.jsx');

var GraphThemesDragDropContainer = React.createClass({
    render: function() {

        console.log("GraphThemesDragDropContainer render: ", this.props.graphThemes);

        return (
            <div className="col-md-12">
                <h4>SceneGraph</h4>

                <ul>
                    <TreePositionLandingContainer indentation="rootLevel" graphTheme={this.props.graphThemes ? this.props.graphThemes['city'] : {}} node={'city'} sceneGraph={this.props.sceneGraph}/>

                    { Object.keys(this.props.graphThemes).map(function(property){
                        console.log("GraphThemesDragDropContainer render foreach: [property: " + property + "]", this.props.graphThemes[property]);
                        return <TreePositionLandingContainer indentation="rootLevel" graphTheme={this.props.graphThemes[property]} node={property} sceneGraph={this.props.sceneGraph}/>
                    }, this)}
                </ul>

            </div>
        )
    }
});

module.exports = DragDropContext(HTML5Backend)(GraphThemesDragDropContainer);


//return <TreePositionLandingContainer indentation="rootLevel" graphTheme={this.props.graphThemes[property]} node={property} sceneGraph={this.props.sceneGraph}/>
//return <li>{this.props.graphThemes[property]}</li>
