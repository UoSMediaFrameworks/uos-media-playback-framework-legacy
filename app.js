'use strict';

var static_server = require('./static_server');

static_server(process.env.DIST || 'dist');
