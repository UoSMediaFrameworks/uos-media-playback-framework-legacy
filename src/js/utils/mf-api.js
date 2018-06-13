'use strict'

const connectionCache = require('./connection-cache');
const Swagger = require('swagger-client');
const Limiter = require('limiter').RateLimiter;

const swaggerApiSpecUrl = process.env.MF_API_DOCS_JSON;

let swaggerClient = null;
let AudioMessageLimiter = new Limiter(10, 1000, true);

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

    static AudioScale(token, data) {
        return {
            url: '/playback/scene/audio/scale',
            pathName: '/playback/scene/audio/scale',
            method: "POST",
            parameters: {
                rescaleAudioForScene: data
            },
            requestInterceptor: function (req) {
                req.headers["x-api-key"] = token;
                return req;
            }
        };
    }

    static ApplySceneConfigByName(token, data) {
        return {
            url: '/playback/scene/config/apply/byname',
            pathName: '/playback/scene/config/apply/byname',
            method: "POST",
            parameters: {
                applyNamedSceneConfig: {
                    namedSceneConfig: data.config,
                    sceneId: data.sceneId
                }
            },
            requestInterceptor: function (req) {
                req.headers["x-api-key"] = token;
                return req;
            }
        };
    }

    static SendSceneConfig(data) {
        return new Promise((resolve, reject) => {
            if (!swaggerClient) {
                Swagger(swaggerApiSpecUrl)
                    .then(client => {
                        swaggerClient = client;

                        swaggerClient.execute(MediaframeworkAPI.ApplySceneConfigByName(connectionCache.getToken(), data))
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                swaggerClient.execute(MediaframeworkAPI.ApplySceneConfigByName(connectionCache.getToken(), data))
                    .then(resolve)
                    .catch(reject);
            }
        })
    }

    static sendAudioScale(data) {
        console.log(data);
        return new Promise((resolve, reject) => {
            AudioMessageLimiter.removeTokens(1, function (err, remainingRequests) {
                if (err) {
                    console.log("Rate limiter error", err)
                } else {
                    if (remainingRequests < 1) {
                        console.log("Rate limit reached, too many requests")
                    } else {
                        if (!swaggerClient) {
                            Swagger(swaggerApiSpecUrl)
                                .then(client => {
                                    swaggerClient = client;

                                    swaggerClient.execute(MediaframeworkAPI.AudioScale(connectionCache.getToken(), data))
                                        .then(resolve)
                                        .catch(reject);
                                })
                                .catch(reject);
                        } else {
                            swaggerClient.execute(MediaframeworkAPI.AudioScale(connectionCache.getToken(), data))
                                .then(resolve)
                                .catch(reject);
                        }
                    }
                }

            });

        })
    }

    static restartController() {
        return new Promise((resolve, reject) => {

            if (!swaggerClient) {
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
