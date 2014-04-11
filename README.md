MediaPlaybackFramework
======================



Layers for Media Framework
•	MediaPlayers : display media request responding to a MediaPlayerController or MediaHub 
  o	HTMLCanvasMediaPlayer (priority 1)
  o	HTMLWebGLMediaPlater (priority 2)
  o	UnityGameEngineMediaPlayer (priority 3)
  o	EpicGameEngineMediaPlayer (priority 3)
•	MediaPlayerController : UI (staring with html) for building media scenes for playback on a hub or player
  o	HTML interface
  o	Saves MediaScene to JSON to local storage for testing or direct real-time control over a media Controller
  o	Saves MediaScene to PlayerPlayerController
•	MediaController : interacts with MediaHubs to control MediaPlayers by a MediaPlayerContoller of files using the MediaConrollerAPI
•	MediaHub : Media Players subscribe to a media hub. MediaHub directly control players though a websocket
•	MediaControllerAPI : API used to control MeidaPlayers and Hubs
•	ServerPlayerController : Server that plays MediaScenes to MediaControllers
