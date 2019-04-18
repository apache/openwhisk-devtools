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
DEBUG.trace("NodeJS runtime initializing...");
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
const platformFactory = require('./platform/platform.js');
const factory = new platformFactory(app, config, service);
const targetPlatform = process.env.__OW_RUNTIME_PLATFORM;

// default to "openwhisk" platform initialization if not defined
// TODO export isvalid() from platform, if undefined this is OK to default, but if not valid value then error out
if (typeof targetPlatform === "undefined") {
    targetPlatform = platformFactory.PLATFORM_OPENWHISK;
    // console.log("__OW_RUNTIME_PLATFORM is undefined; defaulting to 'openwhisk' ...");
}

if (!platformFactory.isSupportedPlatform(targetPlatform)) {
    console.error("__OW_RUNTIME_PLATFORM ("+targetPlatform+") is not supported by the runtime.");
    process.exit(9);
}

/**
 * Register different endpoint handlers depending on target PLATFORM and its expected behavior.
 * In addition, register request pre-processors and/or response post-processors as needed
 * to move data where the platform and function author expects it to be.
 */

const platformImpl = factory.createPlatformImpl(targetPlatform);

if (typeof platformImpl !== "undefined") {

    platformImpl.registerHandlers(app, platformImpl);

    // short-circuit any requests to invalid routes (endpoints) that we have no handlers for.
    app.use(function (req, res, next) {
        res.status(500).json({error: "Bad request."});
    });

    /**
     * Register a default error handler. This effectively only gets called when invalid JSON is received
     * (JSON Parser) and we do not wish the default handler to error with a 400 and send back HTML in the
     * body of the response.
     */
    app.use(function (err, req, res, next) {
        console.log(err.stackTrace);
        res.status(500).json({error: "Bad request."});
    });

    service.start(app);

} else {
    console.error("Failed to initialize __OW_RUNTIME_PLATFORM ("+targetPlatform+").");
    process.exit(10);
}
