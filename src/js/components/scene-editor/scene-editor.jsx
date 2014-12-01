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
                    <div className='scene-selector'>
                        <form className='form-inline' role='form'>
                            <div className='form-group'>
                                <SceneList />
                            </div>
                            <div className='form-group'>
                                <button type='button' className='btn btn-link'>+ Create New Scene</button>
                            </div>
                        </form>
                        
                    </div>
        		</div>
                <div className="col-sm-12">
                    <SceneJsonEditor />
                </div>
        	</div>
        );
    }

});

module.exports = SceneEditor;