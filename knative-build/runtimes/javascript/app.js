/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var dbg = require('./utils/debug');
var DEBUG = new dbg();
DEBUG.trace("Hello World from NodeJS runtime");
DEBUG.dumpObject(process.env, "process.env");

// __OW_ALLOW_CONCURRENT: see docs/concurrency.md
var config = {
        'port': 8080,
        'apiHost': process.env.__OW_API_HOST,
        'allowConcurrent': process.env.__OW_ALLOW_CONCURRENT,
        'requestBodyLimit': "48mb"
};

var bodyParser = require('body-parser');
var express    = require('express');

/**
 * instantiate app as an instance of Express
 * i.e. app starts the server
 */
var app = express();

/**
 * instantiate an object which handles REST calls from the Invoker
 */
var service = require('./src/service').getService(config);

/**
 * setup a middleware layer to restrict the request body size
 * this middleware is called every time a request is sent to the server
 */
app.use(bodyParser.json({ limit: config.requestBodyLimit }));

// identify the target Serverless platform
const platformFactory = require('./platforms/platform.js');
var targetPlatform = process.env.__OW_RUNTIME_PLATFORM;

// default to "openwhisk" platform initialization if not defined
if( typeof targetPlatform === "undefined") {
    console.error("__OW_RUNTIME_PLATFORM is undefined; defaulting to 'openwhisk' ...");
    targetPlatform = platformFactory.PLATFORM_OPENWHISK;
}

/**
 * Register different endpoint handlers depending on target PLATFORM and its expected behavior.
 * In addition, register request pre-processors and/or response post-processors as needed.
 */
// if (targetPlatform === platformFactory.PLATFORM_OPENWHISK) {
//     app.post('/init', wrapEndpoint(service.initCode));
//     app.post('/run', wrapEndpoint(service.runCode));
// } else if (targetPlatform === platformFactory.PLATFORM_KNATIVE) {
     var platform = new platformFactory(targetPlatform, app, service, config);
     DEBUG.dumpObject(platform,"platform");
     var impl = platform.getPlatform();
     DEBUG.dumpObject(impl,"impl");
     // var platform = new platformFactory("knative", service, config);
     // platform.registerHandlers(app, platform);
// } else {
//     console.error("Environment variable '__OW_RUNTIME_PLATFORM' has an unrecognized value ("+targetPlatform+").");
// }

// short-circuit any requests to invalid routes (endpoints) that we have no handlers for.
app.use(function (req, res, next) {
    res.status(500).json({error: "Bad request."});
});

// register a default error handler. This effectively only gets called when invalid JSON is received (JSON Parser)
// and we do not wish the default handler to error with a 400 and send back HTML in the body of the response.
app.use(function (err, req, res, next) {
    console.log(err.stackTrace);
    res.status(500).json({error: "Bad request."});
});

service.start(app);

/**
 * Wraps an endpoint written to return a Promise into an express endpoint,
 * producing the appropriate HTTP response and closing it for all controllable
 * failure modes.
 *
 * The expected signature for the promise value (both completed and failed)
 * is { code: int, response: object }.
 *
 * @param ep a request=>promise function
 * @returns an express endpoint handler
 */
function wrapEndpoint(ep) {
    DEBUG.functionStart("wrapping: " + ep.name);
    DEBUG.functionEnd("returning wrapper: " + ep.name);
    return function (req, res) {
        try {
            ep(req).then(function (result) {
                res.status(result.code).json(result.response);
                DEBUG.dumpObject(result,"result");
                DEBUG.dumpObject(res,"response");
                DEBUG.functionEndSuccess("wrapper for: " + ep.name);
            }).catch(function (error) {
                if (typeof error.code === "number" && typeof error.response !== "undefined") {
                    res.status(error.code).json(error.response);
                } else {
                    console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                    res.status(500).json({ error: "Internal error." });
                }
                DEBUG.dumpObject(error,"error");
                DEBUG.dumpObject(res,"response");
                DEBUG.functionEndError(error, "wrapper for: " + ep.name);
            });
        } catch (e) {
            // This should not happen, as the contract for the endpoints is to
            // never (externally) throw, and wrap failures in the promise instead,
            // but, as they say, better safe than sorry.
            console.error("[wrapEndpoint]", "exception caught", e.message);
            res.status(500).json({ error: "Internal error (exception)." });
            DEBUG.dumpObject(error,"error");
            DEBUG.functionEndError(error, ep.name);
        }
    }
}
