'use strict';

var connect = require('connect'),
    serverStatic = require('serve-static'),
    connectLivereload = require('connect-livereload'),
    path = require('path'),
    server = connect();


module.exports = function(dest, opt) {

    var o = opt || {},
        livereload = o.livereload || false,
        callback = o.callback || null;


    if ( livereload ) {
        server.use(connectLivereload());
    }

    server.use(serverStatic(path.join(__dirname, dest), {'index': ['index.html']}));
    server.listen(process.env.PORT || 5000, callback);
};

