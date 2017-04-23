'use strict';

// APEP TODO this is mainly just research work using the grid framework - this should be refactored and adjusted to use cases or removed

var React = require('react');
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
var ReactGridLayout = require('react-grid-layout');
var IFrame = require('react-iframe');

var GridTest = React.createClass({

    render: function() {

        // layout is an array of objects, see the demo for more complete usage
        // var layout = [
        //     {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
        //     {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
        //     {i: 'c', x: 4, y: 0, w: 1, h: 2}
        // ];

        // <div key={'a'} style={style}>a</div>
        // <div key={'b'} style={style}>b</div>
        // <div key={'c'} style={style}>c</div>

        var layout = {
            lg: [{i: 'a', x: 0, y: 0, w: 3, h: 4},
                {i: 'b', x: 6, y: 0, w: 3, h: 4}]
        };

        var style = {
            "backgroundColor": "white"
        };

        return (
            <ResponsiveReactGridLayout className="layout" layout={layout}
               breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
               cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>

                <div key={'a'} style={style}>
                    <IFrame url="/graph-viewer.html#/?room=presentation" width="100%" height="100%"></IFrame>
                </div>
                <div key={'b'} style={style}>
                    <IFrame url="http://dev-uos-mediahubgraph.azurewebsites.net/?id=586f958fb8678acc10b1597f&roomId=presentation" ></IFrame>
                </div>

            </ResponsiveReactGridLayout>
        )
    }
});

module.exports = GridTest;
