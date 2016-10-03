'use strict';

var connect = require('connect'),
    serverStatic = require('serve-static'),
    connectLivereload = require('connect-livereload'),
    server = connect();


module.exports = function(dest, opt) {
    var o = opt || {},
        livereload = o.livereload || false,
        callback = o.callback || null;


    if ( livereload ) {
        server.use(connectLivereload());
    }

    server.use(serverStatic(dest, {'index': ['index.html']}));
    var listener = server.listen( 5000, function(){
        console.log('Listening on port ' + listener.address().port); //Listening on port 8888
    });
};

