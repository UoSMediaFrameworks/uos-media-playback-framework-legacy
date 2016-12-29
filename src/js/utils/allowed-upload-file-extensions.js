'use strict';


var imageFileTypes = ["png", "jpg","webp","gif","svg"];
var videoFileTypes = ["mov", 'mp4',"webm","flv","wmv","avi","ogg","qt","asf","mpg","3gp"];
var allFileTypes = imageFileTypes.concat(videoFileTypes);

module.exports = {
    IMAGE_FILE_TYPES: imageFileTypes,
    VIDEO_FILE_TYPES: videoFileTypes,
    ALL_FILE_TYPES: allFileTypes
};
