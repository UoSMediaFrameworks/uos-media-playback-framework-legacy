'use strict';
/*jshint browser: true */

var React = require('react');
var SceneActions = require('../../actions/scene-actions');
var FormHelper = require('../../mixins/form-helper');
var AddMediaObjectStore = require('../../stores/add-media-object-store');
var toastr = require("toastr");
var _ = require('lodash');
var getHostname = require('../../utils/get-hostname');
var ReactResumableJs = require('react-resumable-js').default;
var ALL_FILE_TYPES = require('../../utils/allowed-upload-file-extensions').ALL_FILE_TYPES;
var connectionCache = require('../../utils/connection-cache');
var hat = require('hat');

var assetUploadApi = process.env.ASSET_STORE + '/api/resumable/upload/media';

var SceneEditor = React.createClass({

	mixins: [FormHelper],

	getInitialState: function() {
		return this.getStateFromStore();
	},

	getStateFromStore: function() {
		return {
			loading: AddMediaObjectStore.loading(),
			inputValue: AddMediaObjectStore.inputValue()
		};
	},

	componentDidMount:function(){
	    AddMediaObjectStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
	    AddMediaObjectStore.removeChangeListener(this._onChange);
	},

	_onChange:function(){
	    this.setState(this.getStateFromStore());
	},

	handleInputChange: function(event) {
		this.setState({inputValue: event.target.value});
	},

	handleSubmit: function(event) {
		event.preventDefault();
		var content = this.getRefNode('content'),
			data = content.value;

		if (data.match(/https?:\/\//i)) {
			switch (getHostname(data)) {
				case 'soundcloud.com':
					SceneActions.addSoundCloud(this.props.scene._id, data);
					break;

				case 'vimeo.com':
					SceneActions.addVimeo(this.props.scene._id, data);
					break;
				// assume it's an image
				default:
					SceneActions.addMediaObject(this.props.scene._id, {type: 'image', url: data});

			}
		} else {
			SceneActions.addText(this.props.scene._id, data);
		}


	},
    resumableOnFileAddedError:function(file,errorCount){
	    console.log("file added fail",file,errorCount);
	    toastr.warning("File failed");
    },
    resumableOnFileSuccess: function(file, message) {
        console.log("add-media-object - resumableOnFileSuccess");
        console.log(file, message);

        // APEP after upload is complete, we can push this as a scene update.
        SceneActions.finaliseResumableUploadAsset(this.props.scene._id, file.file, file, function() {
            // APEP callback was originally used to reallow users to continue uploading, however to support multiple
            // file uploading, this has been moved.
        });
    },

    resumableOnFileAdded: function(file, resumable) {
        console.log("add-media-object - resumableOnFileAdded");
        SceneActions.uploadingAssets();
        resumable.upload();
    },

    resumableOnCompleteUpload: function() {
        // APEP TODO we should really replace our own overlay by using the library (resumable-js in react-resumable-js)
        console.log("add-media-object - resumableOnCompleteUpload");
        SceneActions.uploadingAssetsFinished();
    },

	render: function() {
		var text = this.state.loading ? 'Loading...' : 'Add';

		return (
			<form onSubmit={this.handleSubmit} className='add-media-object'>

                <ReactResumableJs
                    uploaderID="image-upload"
                    dropTargetID="media-upload-drop-target"
                    filetypes={ALL_FILE_TYPES}
                    fileAccept={"*"}
                    fileAddedMessage="Started!"
                    completedMessage="Complete!"
                    service={assetUploadApi}
                    query={{token: connectionCache.getToken()}}
                    generateUniqueIdentifier={function() { return hat(); }}
                    textLabel="Uploaded files"
                    previousText="Drop to upload your media:"
                    onFileSuccess={this.resumableOnFileSuccess}
                    onFileAdded={this.resumableOnFileAdded}
                    onFileAddedError={this.resumableOnFileAddedError}
                    onCompleteUpload={this.resumableOnCompleteUpload}
                    maxFiles={20}
                    maxFileSize={2000000000}
                    showFileList={false}
                > </ReactResumableJs>

				<input ref='content'
					   value={this.state.inputValue}
					   onChange={this.handleInputChange}
				       className='form-control'
				       placeholder='vimeo url, soundcloud url or text'
				       required />

				<button className='btn btn-dark' type='submit'
				 disabled={this.state.loading}>
				 	{text}
				</button>

			</form>
		);
	}

});

module.exports = SceneEditor;
