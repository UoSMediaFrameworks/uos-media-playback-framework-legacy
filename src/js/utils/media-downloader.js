
var JSZip = require("jszip")


class MediaDownloader {

    constructor() {
        this.zip = new JSZip();
    }

    addUrlToZip(url) {
        var self = this;
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
            self.zip.file(guid + "_" + simpleFileName, this.response);
            resolve()
          }
          httpRequest.send()
        })
    }

    downloadAsZipFile(urls, filename) {
        var self = this;
        self.zip = new JSZip(); //need to create new zip object or old files remain
        //promise structure to zip all files and download.
        Promise.all(urls.map(function(url) {
            return self.addUrlToZip(url)
          }))
          .then(function() {
            self.zip.generateAsync({
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
        URL.revokeObjectURL(blobURL);
    }

}

module.exports = MediaDownloader;
