var React = require('react');




var Player = React.createClass({
	
    render: function() {
        var json = JSON.stringify(this.props.scene);
        return (
            <div id="player">
                <pre>{json}</pre>
            </div>
        );
    }

});

module.exports = Player;