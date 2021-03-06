var JSZip = require("jszip")
var TagMatcher = require('./tag-matcher');
var _ = require('lodash');
var soundCloud = require('./sound-cloud');
require('screw-filereader');
var streamSaver = require('streamsaver');


class ThemeDownloader {

    constructor() {
        this.zip = new JSZip();
    }

    download(scene, progressCB, errorCB, completeCB) {
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
                            if(mediaObject.url.startsWith("https://soundcloud") || mediaObject.url.startsWith("http://soundcloud")) {
                                soundCloud.streamUrl(mediaObject.url, function(err, streamUrl) {
                                     if (!err) {
                                        files.push({"url": streamUrl, "theme": themeName})
                                        mediaObject.isInTheme = true; //use this to keep track of media not in any theme!
                                     }
                                    })
                                } else {
                                    files.push({"url": mediaObject.url, "theme": themeName})
                                    mediaObject.isInTheme = true; //use this to keep track of media not in any theme!
                                }
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
                        if(mediaObject.url.startsWith("https://soundcloud") || mediaObject.url.startsWith("http://soundcloud")) {
                            soundCloud.streamUrl(mediaObject.url, function(err, streamUrl) {
                                 if (!err) {
                                    files.push({"url": streamUrl, "theme": "_none_"})
                                 }
                                })
                            } else {
                                files.push({"url": mediaObject.url, "theme": "_none_"})
                            }
                    }
                }
            }
        });

        console.log(files)
        var filename = sceneClone._id + "_" + sceneClone.name + "_themes" + ".zip";
        this.downloadAsZipFile(files, filename, progressCB, errorCB, completeCB)

    }

    addToZip(downloadObject, progressCB, outOf) {
        var url = downloadObject.url;
        var folder = downloadObject.theme;
        var attemptsRemaining = 3;
        var self = this;
        return new Promise(function(resolve, reject) {
          var httpRequest = new XMLHttpRequest();
          httpRequest.responseType="blob";
          httpRequest.open("GET", url);
          httpRequest.onload = function() {
              var simpleFileName = url.split('/').pop().split('#')[0].split('?')[0]; //filename from URL
              var guid = url.split('/')[url.split('/').length-2] //guid location in mf asset store.
              if (simpleFileName.endsWith("stream")) {
                  simpleFileName += ".mp3" // for soundcloud
              }
            self.zip.file(folder + "/" + guid + "_" + simpleFileName, this.response);
            progressCB(outOf);
            resolve()
          }
          httpRequest.onerror = function() {
            attemptsRemaining --;
            if(attemptsRemaining > 0) {
                httpRequest.open("GET", url);
                httpRequest.send(); //keep trying
            } else {
                reject(); //fail download
            }
          }
          httpRequest.send()
        })
    }

    downloadAsZipFile(downloadObjects, filename, progressCB, errorCB, completeCB) {
        var self = this;
        self.zip = new JSZip(); //need to create new zip object or old files remain
        //promise structure to zip all files and download.
        Promise.all(downloadObjects.map(function(downloadObject) {
            return self.addToZip(downloadObject, progressCB, downloadObjects.length)
          }))
          .then(function() {
            self.zip.generateAsync({
                type: "blob",
            })
            .then(function(content) {
                self.downloadBlobWithFileName(content, filename);
                completeCB();
            }).catch(error => {
                errorCB(); //download failed.
              });
          })
      }

    /*~500MB limit due to chrome! 2GB in firefox...
    downloadBlobWithFileName(blob, filename) {
        let blobURL = URL.createObjectURL(blob)
        //workaround to rename blob!
        let a = document.createElement("a")
        a.download = filename
        a.href = blobURL
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobURL);
    }*/

    /*streams zip directly to file using serviceworker (no memory limit) but requires HTTPS so disabled for now.
    streamZipToFile(zip, filename) {
        let fileStream = streamSaver.createWriteStream(filename).getWriter()
            zip.generateInternalStream({type: "blob"})
                .on('data', data => fileStream.write(data))
                .on('error', err => {fileStream.abort(); console.log("Download error", err)})
                .on('end', () => fileStream.close())
                .resume()
    }
    */

   //stream zip not async but fast alows multi GB file sizes.
   downloadBlobWithFileName(blob, filename) {
    let fileStream = streamSaver.createWriteStream(filename)
    blob.stream().pipeTo(fileStream)
   }

}

module.exports = ThemeDownloader;
