var JSZip = require("jszip")
var streamSaver = require('streamsaver');


var MediaDownloader = {
    
    constructor: function () {
        this.zip = new JSZip();
    }

    
    addUrlToZip(url, progressCB) {
        var self = this;
        var attemptsRemaining = 3;
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
            self.zip.file(guid + "_" + simpleFileName, this.response);
            progressCB();
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

    downloadAsZipFile(urls, filename, progressCB, errorCB, completeCB) {
        var self = this;
        self.zip = new JSZip(); //need to create new zip object or old files remain
        //promise structure to zip all files and download.
        Promise.all(urls.map(function(url) {
            return self.addUrlToZip(url, progressCB)
          }))
          .then(function() {
                progressCB();
              self.zip.generateAsync({type: "blob"}).then(function(content) {
                  self.downloadBlobWithFileName(content, filename)
                  completeCB();
              })
            })
          .catch(error => {
            errorCB();
          });
      }

    /*streams zip directly to file using serviceworker (no memory limit) but requires HTTPS so disabled for now.
    streamZipToFile(zip, filename) {
        let fileStream = streamSaver.createWriteStream(filename).getWriter()
            zip.generateInternalStream({type: "blob"})
                .on('data', data => fileStream.write(data))
                .on('error', err => {fileStream.abort(); console.log("Download error", err)})
                .on('end', () => fileStream.close())
                .resume()
                
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
    */

   //stream zip not async but fast alows 1GB file sizes.
   downloadBlobWithFileName(blob, filename) {
    let fileStream = streamSaver.createWriteStream(filename)
    blob.stream().pipeTo(fileStream)
}





module.exports = MediaDownloader;
