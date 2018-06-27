var JSZip = require("JSzip")
var TagMatcher = require('./tag-matcher');
var _ = require('lodash');

class ThemeDownloader {

    constructor() {
        this.zip = new JSZip();
    }

    download(scene) {
        var sceneClone = _.cloneDeep(scene) //make sure no changes made to scene object refrence!
        var mediaObjectList = sceneClone.scene;
        var themes = sceneClone.themes
        var files = [];

        mediaObjectList.forEach(mediaObject => {
            mediaObject.isInTheme = false;
        })

        //themes are stored as object keys not an array!! 
        Object.keys(themes).forEach(function(key) {
            var themeName = key;
            var themeQueryString = themes[key];
            let themeTagMatcher = new TagMatcher("(" + themeQueryString + ")")

            var themeMediaObjects = []
            //find all matching media objects
            mediaObjectList.forEach((mediaObject, index) => {
                let isMatchedByTagMatcher = themeTagMatcher.match(mediaObject.tags);
                if (isMatchedByTagMatcher) {
                    if (mediaObject.hasOwnProperty("url")) {
                        if(mediaObject.type == "audio") { //TEMP LIMIT TO AUDIO ONLY!
                            files.push({"url": mediaObject.url, "theme": themeName})
                            mediaObject.isInTheme = true; //use this to keep track of media not in any theme!
                        }
                    }
                } 
            })
        })

        //final pass to find objects not in themes!
        mediaObjectList.forEach(mediaObject => {
            if (mediaObject.isInTheme == false) {
                if (mediaObject.hasOwnProperty("url")) {
                    if(mediaObject.type == "audio") { //TEMP LIMIT TO AUDIO ONLY!
                        files.push({"url": mediaObject.url, "theme": "_none_"})
                    }
                }
            }
        });

        console.log(files)
        var filename = sceneClone._id + "_" + sceneClone.name + "_themes" + ".zip";
        this.downloadAsZipFile(files, filename)

    }

    addToZip(downloadObject) {
        var url = downloadObject.url;
        var folder = downloadObject.theme;
        return new Promise(function(resolve) {
          var httpRequest = new XMLHttpRequest();
          httpRequest.responseType="blob";
          httpRequest.open("GET", url);
          httpRequest.onload = function() {
              var simpleFileName = url.split('/').pop().split('#')[0].split('?')[0]; //filename from URL
              var guid = url.split('/')[url.split('/').length-2] //guid location in mf asset store.
              if (simpleFileName.endsWith("stream")) {
                  simpleFileName += ".mp3" // for soundcloud
              }
            zip.folder()
            zip.file(folder + "/" + guid + "_" + simpleFileName, this.response);
            resolve()
          }
          httpRequest.send()
        })
    }

    downloadAsZipFile(downloadObjects, filename) {
        var self = this;
        zip = new JSZip(); //need to create new zip object or old files remain
        //promise structure to zip all files and download.
        Promise.all(downloadObjects.map(function(downloadObject) {
            return self.addToZip(downloadObject)
          }))
          .then(function() {
            console.log(zip);
            zip.generateAsync({
                type: "blob",
            })
            .then(function(content) {
                self.downloadBlobWithFileName(content, filename);
            });
          })
      }

    downloadBlobWithFileName(blob, filename) {
        let blobURL = URL.createObjectURL(blob)

        //workaround to rename blob!
        let a = document.createElement("a") 
        a.download = filename
        a.href = blobURL
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

}

module.exports = ThemeDownloader;