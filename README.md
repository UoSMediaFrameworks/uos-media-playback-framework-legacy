# MediaPlaybackFramework


## HTMLMediaPlayer

Front end media player creating and previewing MediaScene JSON.

### Usage
A fully functional version of the HTMLMediaPlayer is included in `dist/` directory.  Open up `dist/index.html` in your browser and start editing a scene.

### Directory Structure

#### app
Contains source code for development.  Development should happen in here.

#### dist
Version of app working and ready to go

### Development
For contributing you'll want to have [npm](https://www.npmjs.org/) installed.

Install [yeoman](http://yeoman.io/), this'll give us some handy tools development and deployment.
```
npm install -g yo
```

Checkout the repo and cd into the folder
```
git clone git@github.com:Colum-SMA-Dev/MediaPlaybackFramework.git
cd MediaPlaybackFramework
```
Install our required packages
```
npm install
```
Launch the local webserver
```

install our client side packages
```
bower install
```

grunt serve
```

### Deployment

Using [Grunt](http://gruntjs.com/) (which was installed when we install yeoman above), packaging for deployment is one command
```
grunt build
```











Old notes Layers for Media Framework
---------------------


- MediaPlayers : display media request responding to a MediaPlayerController or MediaHub
  - HTMLCanvasMediaPlayer (priority 1)
  - HTMLWebGLMediaPlater (priority 2)
  - UnityGameEngineMediaPlayer (priority 3)
  - EpicGameEngineMediaPlayer (priority 3)
- MediaPlayerController : UI (staring with html) for building media scenes for playback on a hub or player
  - HTML interface
  - Saves MediaScene to JSON to local storage for testing or direct real-time control over a media Controller
  - Saves MediaScene to PlayerPlayerController
- MediaController : interacts with MediaHubs to control MediaPlayers by a MediaPlayerContoller of files using the MediaConrollerAPI
- MediaHub : Media Players subscribe to a media hub. MediaHub directly control players though a websocket
- MediaControllerAPI : API used to control MediaPlayers and Hubs JSON XML
- ServerPlayerController : Server that plays MediaScenes to MediaControllers uses HTTP Websockets
