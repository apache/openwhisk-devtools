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

var dbg = require('../utils/debug');
var DEBUG = new dbg();

const OW_ENV_PREFIX = "__OW_";

/**
 * Pre-process the incoming
 */
function preProcessInitData(env, initdata, valuedata, activationdata) {
    DEBUG.functionStart();
    try {
        // Set defaults to use INIT data not provided on the request
        // Look first to the process (i.e., Container's) environment variables.
        var main = (typeof env.__OW_ACTION_MAIN === 'undefined') ? "main" : env.__OW_ACTION_MAIN;
        // TODO: Throw error if CODE is NOT defined!
        var code = (typeof env.__OW_ACTION_CODE === 'undefined') ? "" : env.__OW_ACTION_CODE;
        var binary = (typeof env.__OW_ACTION_BINARY === 'undefined') ? false : env.__OW_ACTION_BINARY.toLowerCase() === "true";
        // TODO: deault to empty?
        var actionName = (typeof env.__OW_ACTION_NAME === 'undefined') ? "" : env.__OW_ACTION_NAME;
        DEBUG.dumpObject(actionName, "Action name");
        DEBUG.dumpObject(main, "Action main");
        DEBUG.dumpObject(code, "Action code");
        DEBUG.dumpObject(binary, "Action binary");

        // Look for init data within the request (i.e., "stem cell" runtime, where code is injected by request)
        if (typeof(initdata) !== "undefined") {
            if (initdata.name && typeof initdata.name === 'string') {
                // TODO: Throw error if BINARY is not 'true' or 'false'
                actionName = initdata.name;
            }
            if (initdata.main && typeof initdata.main === 'string') {
                main = initdata.main
            }
            if (initdata.code && typeof initdata.code === 'string') {
                code = initdata.code
            }
            if (initdata.binary && typeof initdata.binary === 'boolean') {
                // TODO: Throw error if BINARY is not 'true' or 'false'
                binary = initdata.binary
            }
        }

        // Move the init data to the request body under the "value" key.
        // This will allow us to reuse the "openwhisk" /init route handler function
        valuedata.main = main;
        valuedata.code = code;
        valuedata.binary = binary;

        // Action name is a special case, as we have a key collision on "name" between init. data and request
        // param. data (as they both appear within "body.value") so we must save it to its final location
        // as the default Action name as part of the activation data
        // NOTE: if action name is not present in the action data, we will set it regardless even if an empty string
        if( typeof(activationdata) !== "undefined" ) {
            if ( typeof(activationdata.action_name) === "undefined" ||
                (typeof(activationdata.action_name) === "string" && activationdata.action_name.length == 0 )){
                activationdata.action_name = actionName;
            }
        }

        DEBUG.dumpObject(valuedata.main, "valuedata.main");
        DEBUG.dumpObject(valuedata.code , "valuedata.code");
        DEBUG.dumpObject(valuedata.binary, "valuedata.binary");

    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw("Unable to initialize the runtime: " + e.message);
    }
    DEBUG.functionEnd();
}

/**
 * Pre-process the incoming http request data, moving it to where the
 * route handlers expect it to be for an openwhisk runtime.
 */
function preProcessActivationData(env, activationdata) {
    DEBUG.functionStart();
    try {
        // Note: we move the values here so that the "run()" handler does not have
        // to move them again.
        Object.keys(activationdata).forEach(
            function (k) {
                if (typeof activationdata[k] === 'string') {
                    var envVariable = OW_ENV_PREFIX + k.toUpperCase();
                    process.env[envVariable] = activationdata[k];
                    DEBUG.dumpObject(process.env[envVariable], envVariable, "preProcessActivationData");
                }
            }
        );
    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw("Unable to initialize the runtime: " + e.message);
    }
    DEBUG.functionEnd();
}

/**
 * helper function to set env variables for HTTP Context
 */
function httpContextEnv (key, value) {
    if (typeof value === 'string') {
        process.env[key] = value
        DEBUG.dumpObject(process.env[key], key, "HTTPContext");
    }
}

/**
 * Pre-process HTTP request details, send them as parameters to the action input argument
 * __ow_method, __ow_headers, __ow_path, __ow_user, __ow_body, and __ow_query
 */
function preProcessHTTPContext(req) {
    DEBUG.functionStart()

    try {
        httpContextEnv(OW_ENV_PREFIX + "METHOD", req.method)
        httpContextEnv(OW_ENV_PREFIX + "HEADERS", JSON.stringify(req.headers))
        httpContextEnv(OW_ENV_PREFIX + "PATH", "");

        var namespace = "";
        if (process.env[OW_ENV_PREFIX + "NAMESPACE"] !== undefined) {
            namespace = process.env[OW_ENV_PREFIX + "NAMESPACE"];
        }
        httpContextEnv(OW_ENV_PREFIX + "USER", namespace);

        var bodyStr = JSON.stringify(req.body)
        var bodyBase64 = Buffer.from(bodyStr).toString("base64")
        httpContextEnv(OW_ENV_PREFIX + "BODY", bodyBase64)

        httpContextEnv(OW_ENV_PREFIX + "QUERY", JSON.stringify(req.query));
    } catch (e) {
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw ("Unable to initialize the runtime: " + e.message)
    }
    DEBUG.functionEnd()
}


/**
 * Pre-process the incoming http request data, moving it to where the
 * route handlers expect it to be for an openwhisk runtime.
 */
function preProcessRequest(req){
    DEBUG.functionStart();

    try{
        // Get or create valid references to the various data we might encounter
        // in a request such as Init., Activation and function parameter data.
        let body = req.body || {};
        let valueData = body.value || {};
        let initData = body.init || {};
        let activationData = body.activation || {};
        let env = process.env || {};

        // process initialization (i.e., "init") data
        preProcessInitData(env, initData, valueData, activationData);

        // Fix up pointers in case we had to allocate new maps
        req.body = body;
        req.body.value = valueData;
        req.body.init = initData;
        req.body.activation = activationData;

        // process per-activation (i.e, "run") data
        preProcessActivationData(env, activationData);

    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        // TODO: test this error is handled properly and results in an HTTP error response
        throw("Unable to initialize the runtime: " + e.message);
    }

    DEBUG.functionEnd();
}

function postProcessResponse(result, res) {
    DEBUG.functionStart();

    // After getting the result back from an action, update the HTTP headers,
    // status code, and body based on its result if it includes one or more of the
    // following as top level JSON properties: headers, statusCode, body
    let statusCode = result.code;
    let headers = {};
    let body = result.response;

    // statusCode: default is 200 OK if body is not empty otherwise 204 No Content
    if (result.response.statusCode !== undefined) {
        statusCode = result.response.statusCode;
        delete body['statusCode'];
    }

    // the default content-type for an HTTP response is application/json
    // this default are overwritten with the action specified headers
    if (result.response.headers !== undefined) {
        headers = result.response.headers;
        delete body['headers'];
    }

    // body: a string which is either a plain text, JSON object, or a base64 encoded string for binary data (default is "")
    // body is considered empty if it is null, "", or undefined
    if (result.response.body !== undefined) {
        body = result.response.body;
        delete body['main'];
        delete body['code'];
        delete body['binary'];
    }

    // statusCode: set it to 204 No Content if body is empty
    if (statusCode === 200 && body === "") {
        statusCode = 204;
    }

    res.header(headers).status(statusCode).json(body);

    DEBUG.functionEnd();
}

function PlatformFactory(id, svc, cfg) {

    DEBUG.dumpObject(id, "Platform" );
    DEBUG.dumpObject(svc, "Service" );
    DEBUG.dumpObject(cfg, "Config" );

    var service = svc;
    //var config = cfg;  // TODO: use this to pass future config. information uniformly to any impl.
    var isInitialized = false;

    this.run = function(req, res) {

        try {

            preProcessRequest(req);
            console.info("isInitialized="+isInitialized);

            service.initCode(req).then(function () {
                service.runCode(req).then(function (result) {
                    postProcessResponse(result, res)
                });
            }).catch(function (error) {
                console.error(error);
                if (typeof error.code === "number" && typeof error.response !== "undefined") {
                    res.status(error.code).json(error.response);
                } else {
                    console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                    res.status(500).json({ error: "Internal error." });
                }
            });
        } catch (e) {
            res.status(500).json({error: "internal error"})
        }
    }
};

module.exports = PlatformFactory;
