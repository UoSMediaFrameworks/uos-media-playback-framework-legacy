/**
 * Created by aaronphillips on 17/10/2016.
 */

var gitRev = require('git-rev');
var jsonfile = require('jsonfile');
var https = require('https');

var HOST_URL = 'api.github.com';
var PATH_URL = '/repos/UoSMediaFrameworks/uos-media-playback-framework-legacy/commits/';
var ENV_BRANCH = 'dev';

//APEP: Following github api documentation, a user agent string is required with preference being project name
//https://developer.github.com/v3/#user-agent-required
var GITHUB_API_REQUIRED_USER_AGENT_STRING = 'UoSMediaFramework/uos-media-playback-framework-legacy';
var VERSION_LOCAL_FILE = 'dist/version.json';

if(process.env.NODE_ENV === "production")
    ENV_BRANCH = 'master';

/**
 * Future tool for building in an environment with access to the git repository on the cli
 */
function build() {
    gitRev.short(function (str) {
        var version = { version: str};

        jsonfile.writeFile(VERSION_LOCAL_FILE, version, function (err) {
            console.error(err)
        })

    });
}

/**
 * Using the git hub api stores some project information in a version file in the dist folder.
 *
 * This process is done at build time to save rate limiting effecting this feature.
 *
 * https://developer.github.com/v3/#rate-limiting
 *
 */
function buildUsingGithubPublicAPI(callback) {
    return https.get({
        host: HOST_URL,
        path: PATH_URL + ENV_BRANCH,
        headers: {
            'user-agent': GITHUB_API_REQUIRED_USER_AGENT_STRING
        }
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            console.log("buildUsingGithubPublicAPI - github request complete");

            var githubCommit = JSON.parse(body);

            //APEP: Currently we only watch to cache the sha hash value of the commit, the API provides much greater detail if required
            githubCommit = {
                sha: githubCommit.sha
            };

            callback(githubCommit);
        });
    }).on('error', function(err){
        console.log("buildUsingGithubPublicAPI - github request - err", err);
        callback(null);
    });
}

// APEP in future, if we have a build environment with access to the git repo, we can use a different function
// and improve on this export to export a utils class with both functions
module.exports = {
    buildUsingGithubPublicAPI: buildUsingGithubPublicAPI,
    VERSION_LOCAL_FILE: VERSION_LOCAL_FILE
};
