'use strict';
var React = require('react');
var SceneList = require('./scene-list.jsx');
var ScenePlayer = require('../scene-player.jsx');
var SceneJsonEditor = require('./scene-json-editor.jsx');

var SceneEditor = React.createClass({

    render: function() {
        return (
        	<div className="row">
        		<div className="col-sm-12">
        			<ScenePlayer />
        		</div>
        		<div className="col-sm-12">
        			<SceneList />
        		</div>
                <div className="col-sm-12">
                    <SceneJsonEditor />
                </div>
        	</div>
        );
    }

});

module.exports = SceneEditor;