'use strict'

const connectionCache = require('./connection-cache');
const Swagger = require('swagger-client');

const swaggerApiSpecUrl = process.env.MF_API_DOCS_JSON;

let swaggerClient = null;

class MediaframeworkAPI {

    static _generateRestartControllerMethod(token) {
        return {
            url: '/playback/controller/html/random/reset',
            pathName: '/playback/controller/html/random/reset',
            method: "POST",
            requestInterceptor: function (req) {
                req.headers["x-api-key"] = token;
                return req;
            }
        };
    }

    static restartController() {
        return new Promise((resolve, reject) => {

            if (! swaggerClient) {
                Swagger(swaggerApiSpecUrl)
                    .then(client => {
                        swaggerClient = client;

                        swaggerClient.execute(MediaframeworkAPI._generateRestartControllerMethod(connectionCache.getToken()))
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                swaggerClient.execute(MediaframeworkAPI._generateRestartControllerMethod(connectionCache.getToken()))
                    .then(resolve)
                    .catch(reject);
            }
        })
    }
}

module.exports = MediaframeworkAPI;
