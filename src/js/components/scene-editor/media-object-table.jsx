'use strict';

var React = require('react');
var MediaObjectPreview = require('./media-object-preview.jsx');

var MediaObjectTable = React.createClass({

	render: function() {
		var rows = null;
		
		if (this.props.scene.scene) {
			rows = this.props.scene.scene.map(function(mediaObject) {
				var obj = mediaObject.mediaObject,
					preview;


				return (
					<tr>
						<td>
							<MediaObjectPreview mediaObject={obj} />
						</td>
					</tr>
				);
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