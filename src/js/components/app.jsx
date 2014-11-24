var React = require('react');

var ScenePlayer = require('./scene-player.jsx');
var SceneEditor = require('./scene-editor.jsx');
var SceneJsonEditor = require('./scene-json-editor.jsx');

var HubClient = require('../utils/HubClient');

HubClient.login('http://127.0.0.1:3000', 'kittens');

var App = React.createClass({

    render: function() {
        return (
            <div>
                <div className='row'>
                    <div className='col-sm-12'>
                        <ScenePlayer />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12'>
                        <SceneEditor />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12'>
                        <SceneJsonEditor />
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = App;
