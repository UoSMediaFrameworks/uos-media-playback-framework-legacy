'use strict';

var React = require('react');
var MediaObjectPreview = require('./media-object-preview.jsx');

var React = require('react');

var TableItem = React.createClass({

	render: function() {
		return (
			<tr>
				<td>
					<MediaObjectPreview mediaObject={this.props.mediaObject} />
				</td>
				<td>{this.props.mediaObject.url}</td>
				<td>{this.props.mediaObject.tags}</td>
			</tr>
		);
	}

});


var MediaObjectTable = React.createClass({

	render: function() {
		var rows = null;
		
		if (this.props.scene.scene && this.props.scene.scene.length !== 0) {
			rows = this.props.scene.scene.map(function(mediaObject, index) {
				var obj = mediaObject.mediaObject;

				return <TableItem key={obj.id} mediaObject={obj} />;
			});	
		} else {
			rows = [<tr key='empty'><td>Nothing in the scene yet</td></tr>];
		}

		 
		
		return (
			<table className='table'>
				<thead>
					<tr>
						<th>Preview</th>
						<th>Url</th>
						<th>Tags</th>
						<th>Controls</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}

});

module.exports = MediaObjectTable;