'use strict';

// APEP TODO this is mainly just research work using the grid framework - this should be refactored and adjusted to use cases or removed

var React = require('react');
var ReactGridLayout = require('react-grid-layout');
var IFrame = require('react-iframe');
var Measure = require('react-measure');
var GraphViewer = require('../../pages/viewer/graph-viewer.jsx');

var GridTest = React.createClass({

    getInitialState: function() {
        return {
            dimensions: {
                width: -1,
                height: -1
            }
        }
    },

    onMeasure: function(dimensions) {
        this.setState({dimensions})
    },

    render: function() {

        // APEP initial layout, we have a lot of flexibility here, the grid framework provides us a lot of nice layout options
        var layout = [
            {i: 'a', x: 0, y: 0, w: 6, h: 12, draggableHandle: '.react-grid-drag-handle-player'},
            {i: 'b', x: 6, y: 0, w: 6, h: 12, draggableHandle: '.react-grid-drag-handle-graph'}
        ];

        var style = {
            "backgroundColor": "white"
        };

        var iframeContainerStyle = {
            width: "100%",
            height: "100%"
        };


        // APEP verticalCompact false allows grid to be place independently in any vertical grid position within trying to always merge up to the top
        // APEP TODO handle roomId used in IFRAME component to be non hardcoded, IE use the react lib to find the url query and populate through to the IFRAME link
        return (
            <Measure onMeasure={this.onMeasure}>
                <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={this.state.dimensions.width} verticalCompact={false}>
                    <div key={'a'} style={style}>

                        <div style={iframeContainerStyle}>

                            <hr/>
                            <span className="react-grid-drag-handle-player">[DRAG HERE]</span>
                            <hr/>

                            <GraphViewer></GraphViewer>
                        </div>
                    </div>
                    <div key={'b'} style={style}>

                        <div style={iframeContainerStyle}>

                            <hr/>
                            <span className="react-grid-drag-handle-graph">[DRAG HERE]</span>
                            <hr/>

                            <IFrame url="http://dev-uos-mediahubgraph.azurewebsites.net/?id=586f958fb8678acc10b1597f&roomId=presentation" width="100%" height="100%"></IFrame>
                        </div>
                    </div>
                </ReactGridLayout>

            </Measure>

        )
    }
});

module.exports = GridTest;

