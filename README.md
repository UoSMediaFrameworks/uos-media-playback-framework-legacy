# MediaPlaybackFramework [![Build Status](https://travis-ci.org/Colum-SMA-Dev/MediaHub.svg?branch=master)](https://travis-ci.org/Colum-SMA-Dev/MediaPlaybackFramework.svg?branch=master)

This is the currently the only front end for creating scenes and playing scenes.  For this to work you'll also need a running copy of a [MediaHub](https://github.com/UoSMediaFrameworks/uos-media-hub-legacy), and an [AssetStore](https://github.com/Colum-SMA-Dev/AssetStore).  

## Development

Setup your [MediaHub](https://github.com/UoSMediaFrameworks/uos-media-hub-legacy) and [AssetStore](https://github.com/UoSMediaFrameworks/uos-asset-store-legacy) first if you haven't done so already.

Copy the file [env-example.sh](env-example.sh) to `env.sh`.  Set the `ASSET_STORE` and `MEDIA_HUB` exports to the url's of where those are running (if you're developing locally then just leave the defaults, as those services should default to those ports when running).  

We recommend you use a node version manager like [nvm](https://github.com/creationix/nvm)


`proces.env.DEBUG` - Allows console logs to be stripped out and other development build processes

Node v4.4.7 and npm v2.15.8. 
Install the needed npm packages:
```
npm install
```

Start the local development server:
```
./env.sh gulp
```

The shell script merely provides the appropriate environment variables for whatever is specified after it.

The default gulp task handles a number of things for us:
- bundling the javascript 
- copying the js/html/css to a `dist/` directory
- starting up a local webserver to serve it with
- watching filesystem for changes, then bundling and copying again

Now you may access the editor at [http://localhost:3000](http://localhost:3000) and the viewer at [http://localhost:3000/viewer.html](http://localhost:3000/viewer.html)


## Deployment - Largely Deprecated and needs rewriting

This whole repo is currently setup to be deployed as an [Azure Website](http://azure.microsoft.com).  The [deploy.sh](deploy.sh) file is used by [KuduSync](https://github.com/projectkudu/KuduSync).

However, you can easily deploy it elsewhere.  Just run the `build-dist` gulp command:

```
env.sh gulp build-dist
```

The copy the contents of `dist/` to whereever you'd like to host the files.

## Mocha testing

Ensure mocha is installed globally

```
npm install -g mocha
```

You can now test specific files 

```
mocha test/<rest of file path to test>
mocha test/utils/scene-graph/test-c...
```

## Cross Browser Testing

![Screenshot](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)
