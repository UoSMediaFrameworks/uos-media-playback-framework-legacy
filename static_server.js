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

    server.listen(process.env.PORT || 5000, callback);
};

