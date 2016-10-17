/**
 * Created by aaronphillips on 17/10/2016.
 */

var gitRev = require('git-rev');
var fileSystem = require('fs');
var jsonfile = require('jsonfile');

var file = 'dist/version.json';


function build() {
    gitRev.short(function (str) {
        var version = { version: str};

        jsonfile.writeFile(file, version, function (err) {
            console.error(err)
        })

    });
}

build();

