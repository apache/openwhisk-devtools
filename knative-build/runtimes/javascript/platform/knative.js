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
const CONTENT_TYPE = "Content-Type";

/**
 * Determine if runtime is a "stem" cell, i.e., can be initialized with request init. data
 * @param env
 * @returns {boolean}
 */
function isStemCell(env) {
    let actionCode = env.__OW_ACTION_CODE;
    // It is a stem cell if valid code is "built into" the runtime's process environment.
    return (typeof actionCode === 'undefined' || actionCode.length === 0);
}

/**
 * Determine if the request (body) contains valid activation data.
 * @param req
 * @returns {boolean}
 */
function hasActivationData(req) {
    // it is a valid activation if the body contains an activation and value keys with data.
    if (typeof req.body !== "undefined" &&
        typeof req.body.activation !== "undefined" &&
        typeof req.body.value !== "undefined") {
        return true;
    }
    return false;
}

/**
 * Determine if the request (body) contains valid init data.
 * @param req
 * @returns {boolean}
 */
function hasInitData(req) {
    // it is a valid init. if the body contains an init key with data.
    if (typeof req.body !== "undefined" &&
        typeof req.body.init !== "undefined") {
        return true;
    }
    return false;
}


/**
 * Remove all INIT data from the value data that will be passed to the user function.
 * @param body
 */
function removeInitData(body) {

    DEBUG.dumpObject(body,"body");
    if (typeof body !== "undefined" &&
        typeof body.value !== "undefined") {
        delete body.value.code;
        delete body.value.main;
        delete body.value.binary;
        delete body.value.raw;
    }
}


/**
 * Create request init data from the process environment
 */
function createInitDataFromEnvironment(env) {
    DEBUG.functionStart();
    try {
        var initdata = {};
        initdata.main = (typeof env.__OW_ACTION_MAIN === 'undefined') ? "main" : env.__OW_ACTION_MAIN;
        // TODO: Throw error if CODE is NOT defined!
        initdata.code = (typeof env.__OW_ACTION_CODE === 'undefined') ? "" : env.__OW_ACTION_CODE;
        initdata.binary = (typeof env.__OW_ACTION_BINARY === 'undefined') ? false : env.__OW_ACTION_BINARY.toLowerCase() === "true";
        // TODO: default to empty?
        initdata.actionName = (typeof env.__OW_ACTION_NAME === 'undefined') ? "" : env.__OW_ACTION_NAME;
        initdata.raw = (typeof env.__OW_ACTION_RAW === 'undefined') ? false : env.__OW_ACTION_RAW.toLowerCase() === "true";
        initdata.url = (typeof env.__OW_PROJECT_URL === 'undefined') ? "" : env.__OW_PROJECT_URL;

        DEBUG.dumpObject(initdata, "initdata");
        return initdata;

    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw("Unable to process Initialization data: " + e.message);
    }
    DEBUG.functionEnd();
}


/**
 * Pre-process the init data from the request
 */
function preProcessInitData(initdata, valuedata, activationdata) {
    DEBUG.functionStart();
    try {
        // Look for init data within the request (i.e., "stem cell" runtime, where code is injected by request)
        if (typeof(initdata) !== "undefined") {

            if (initdata.main && typeof initdata.main === 'string') {
                valuedata.main = initdata.main;
            }
            if (initdata.code && typeof initdata.code === 'string') {
                valuedata.code = initdata.code;
            }
            if (initdata.binary) {
                if (typeof initdata.binary === 'boolean') {
                    valuedata.binary = initdata.binary;
                } else {
                    throw ("Invalid Init. data; expected boolean for key 'binary'.");
                }
            }
            if (initdata.raw) {
                if (typeof initdata.raw === 'boolean') {
                    valuedata.raw = initdata.raw;
                } else {
                    throw ("Invalid Init. data; expected boolean for key 'raw'.");
                }
            }
            if (initdata.url && typeof initdata.url === 'string') {
                valuedata.url = initdata.url;
            }

            // Action name is a special case, as we have a key collision on "name" between init. data and request
            // param. data (as they both appear within "body.value") so we must save it to its final location
            // as the default Action name as part of the activation data
            if (initdata.name && typeof initdata.name === 'string') {
                if (typeof (activationdata) !== "undefined") {
                    if (typeof (activationdata.action_name) === "undefined" ||
                        (typeof (activationdata.action_name) === "string" &&
                            activationdata.action_name.length === 0)) {
                        activationdata.action_name = initdata.name;
                    }
                }
            }
        DEBUG.dumpObject(valuedata, "valuedata");
        }

    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw("Unable to process Initialization data: " + e.message);
    }
    DEBUG.functionEnd();
}

/**
 * Pre-process HTTP request information and make it available as parameter data to the action function
 * by moving it to where the route handlers expect it to be (i.e., in the JSON value data map).
 *
 * See: https://github.com/apache/incubator-openwhisk/blob/master/docs/webactions.md#http-context
 *
 * HTTP Context
 * ============
 * All web actions, when invoked, receives additional HTTP request details as parameters to the action
 * input argument. These include:
 *
 * __ow_method (type: string): the HTTP method of the request.
 * __ow_headers (type: map string to string): the request headers.
 * __ow_path (type: string): the unmatched path of the request (matching stops after consuming the action extension).
 * __ow_user (type: string): the namespace identifying the OpenWhisk authenticated subject.
 * __ow_body (type: string): the request body entity, as a base64 encoded string when content is
 *      binary or JSON object/array, or plain string otherwise.
 * __ow_query (type: string): the query parameters from the request as an unparsed string.
 *
 * TODO:
 * A request may not override any of the named __ow_ parameters above; doing so will result in a
 * failed request with status equal to 400 Bad Request.
 */
function preProcessHTTPContext(req, valueData) {
    DEBUG.functionStart();
    try {
        if (valueData.raw) {
            // __ow_body is a base64 encoded string when content is binary or JSON object/array,
            // or plain string otherwise.
            if (typeof req.body.value === "string" && req.body.value !== undefined) {
                valueData.__ow_body = req.body.value;
            } else {
                // make value data available as __ow_body
                const tmpBody = Object.assign({}, req.body.value);
                // delete main, binary, raw, and code from the body before sending it as an action argument
                removeInitData(tmpBody);
                delete tmpBody.main;
                delete tmpBody.code;
                delete tmpBody.binary;
                delete tmpBody.raw;
                var bodyStr = JSON.stringify(tmpBody);
                // note: we produce an empty map if there are no query parms/
                valueData.__ow_body = Buffer.from(bodyStr).toString("base64");;
            }
            valueData.__ow_query = req.query;
        }

        var namespace = "";
        if (process.env[OW_ENV_PREFIX + "NAMESPACE"] !== undefined) {
            namespace = process.env[OW_ENV_PREFIX + "NAMESPACE"];
        }
        valueData.__ow_user = namespace;
        valueData.__ow_method = req.method;
        valueData.__ow_headers = req.headers;
        valueData.__ow_path = "";
    } catch (e) {
        console.error(e);
        DEBUG.functionEndError(e.message);
        throw ("Unable to process HTTP Context: " + e.message)
    }
    DEBUG.functionEnd()
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
        throw("Unable to process Activation data: " + e.message);
    }
    DEBUG.functionEnd();
}

/**
 * For actions having dependency on third party NPM modules, NodeJS runtime would
 * install those NPM modules and package them as part of the action source using this function.
 * In this function, runtime reads url from the initialization JSON payload,
 * if the url points to an existing directory, run:
 *      cd initdata.url && npm install --production && zip -r action.zip . && base64 action.zip
 * Packaging actions as NodeJS module with NPM libraries are treated as zip actions by the runtime.
 * Zipped actions must contain either package.json or index.js at the root.
 * This validation is left to the user and not enforced while initializing the action.
 */
function marshalResources(initData, valueData) {
    DEBUG.functionStart();
    try {
        // check if url is set and assigned some string value
        if (typeof initData.url === "string" && initData.url !== undefined) {
            const fs = require('fs');
            if (fs.existsSync(initData.url)) {
                const stats = fs.lstatSync(initData.url);
                // check if specified url is an existing directory
                if (stats.isDirectory()) {
                    // import spawnSync routine from child_process NPM module
                    // spawnSync spawns a new process using the given command and does not return until
                    // the child process is fully closed/finished executing.
                    // Note: Be very careful changing any of the child_process and spwanSync functionality
                    DEBUG.dumpObject("Starting to install NPM modules from " + initData.url, "process packaging - npm", "marshalResources")
                    const {spawnSync} = require('child_process'),
                        npm = spawnSync('npm', ['install', '--production'], {cwd: initData.url});
                    DEBUG.dumpObject(`stdout: ${npm.stdout.toString().trim()}`, "npm install", "marshalResources");
                    DEBUG.dumpObject(`stderr: ${npm.stderr.toString().trim()}`, "npm install", "marshalResources");
                    if (npm.status !== 0) {
                        throw (npm.error);
                    }

                    var zipFile = "action.zip";
                    // note here we are using same instance of spwanSync as we used for running npm install
                    // to make sure the execution of zip command follows right after npm install closes (sequential)
                    DEBUG.dumpObject("Starting to compress action resources at " + initData.url, "process packaging - zip", "marshalResources")
                    const compressFile = spawnSync('zip', ['-r', zipFile, '.'], {cwd: initData.url});
                    DEBUG.dumpObject(`stdout: ${compressFile.stdout.toString().trim()}`, "zip -r action.zip *", "marshalResources");
                    DEBUG.dumpObject(`stderr: ${compressFile.stderr.toString().trim()}`, "zip -r action.zip *", "marshalResources");
                    if (compressFile.status !== 0) {
                        throw (compressFile.error);
                    }

                    // and same here, making sure base64 command follows right after zip command finishes by
                    // using the same spawnSync instance of child_process.
                    DEBUG.dumpObject("Starting to decode compressed action resource", "process packaging - base64", "marshalResources")
                    const code = spawnSync('base64', [initData.url + '/' + zipFile]);
                    DEBUG.dumpObject(`stdout: ${code.stdout.toString().trim()}`, "base64 action.zip", "marshalResources");
                    DEBUG.dumpObject(`stderr: ${code.stderr.toString().trim()}`, "base64 action.zip", "marshalResources");
                    if (code.status !== 0) {
                        throw (code.error);
                    }

                    // assign base64 encoded zip file content to action code before initializing the action
                    initData.code = code.stdout.toString().trim();
                    valueData.code = initData.code;

                    // mark this action as binary so that run routine can decode it appropriately
                    initData.binary = true;
                    valueData.binary = true;
                }
            }
        }
    } catch (e) {
        console.error(e);
        DEBUG.functionEndError("");
        throw("Unable to marshall NPM resources: ");
    }
    DEBUG.functionEnd()
}

/**
 * Pre-process the incoming http request data, moving it to where the
 * route handlers expect it to be for an openwhisk runtime.
 */
function preProcessRequest(req){
    DEBUG.functionStart();
    try {
        let env = process.env || {};

        // Get or create valid references to the various data we might encounter
        // in a request such as Init., Activation and function parameter data.
        let body = req.body || {};
        let valueData = body.value || {};
        let initData = body.init || {};
        let activationData = body.activation || {};

        // process initialization (i.e., "init") data
        if (hasInitData(req)) {
            preProcessInitData(initData, valueData, activationData);
        }

        marshalResources(initData, valueData);

        if(hasActivationData(req)) {
            // process HTTP request header and body to make it available to function as parameter data
            preProcessHTTPContext(req, valueData);

            // process per-activation (i.e, "run") data
            preProcessActivationData(env, activationData);
        }

        // Fix up pointers in case we had to allocate new maps
        req.body = body;
        req.body.value = valueData;
        req.body.init = initData;
        req.body.activation = activationData;

    } catch(e){
        console.error(e);
        DEBUG.functionEndError(e.message);
        // TODO: test this error is handled properly and results in an HTTP error response
        throw("Unable to process request data: " + e.message);
    }
    DEBUG.functionEnd();
}

function postProcessResponse(req, result, res) {
    DEBUG.functionStart();

    var content_types = {
        json: 'application/json',
        html: 'text/html',
        png: 'image/png',
        svg: 'image/svg+xml',
    };

    // After getting the result back from an action, update the HTTP headers,
    // status code, and body based on its result if it includes one or more of the
    // following as top level JSON properties: headers, statusCode, body
    let statusCode = result.code;
    let headers = {};
    let body = result.response;
    let contentTypeInHeader = false;

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

    // addressing content-type v/s Content-Type
    // marking 'Content-Type' as standard inside header
    if (headers.hasOwnProperty(CONTENT_TYPE.toLowerCase())) {
        headers[CONTENT_TYPE] = headers[CONTENT_TYPE.toLowerCase()];
        delete headers[CONTENT_TYPE.toLowerCase()];
    }

    //  If a content-type header is not declared in the action result’s headers,
    //  the body is interpreted as application/json for non-string values,
    //  and text/html otherwise.
    if (!headers.hasOwnProperty(CONTENT_TYPE)) {
        if (result.response.body !== undefined && typeof result.response.body == "string") {
            headers[CONTENT_TYPE] = content_types.html;
        } else {
            headers[CONTENT_TYPE] = content_types.json;
        }
    } else {
        contentTypeInHeader = true;
    }


    // body: a string which is either a plain text, JSON object, or a base64 encoded string for binary data (default is "")
    // body is considered empty if it is null, "", or undefined
    if (result.response.body !== undefined) {
        body = result.response.body;
        delete body['main'];
        delete body['code'];
        delete body['binary'];
    }

    // When the content-type is defined, check if the response is binary data or
    // plain text and decode the plain text using a base64 decoder whenever needed.
    // Should the body fail to decoded correctly, return an error to the caller.
    if (contentTypeInHeader && headers[CONTENT_TYPE].lastIndexOf("image", 0) === 0) {
        if (typeof body === "string") {
            body = Buffer.from(body, 'base64')
            headers["Content-Transfer-Encoding"] = "binary";
        }
        // TODO: throw an error if body can not be decoded
    }


    // statusCode: set it to 204 No Content if body is empty
    if (statusCode === 200 && body === "") {
        statusCode = 204;
    }

    if (!headers.hasOwnProperty('Access-Control-Allow-Origin')) {
        headers['Access-Control-Allow-Origin'] = '*';
    }
    if (!headers.hasOwnProperty('Access-Control-Allow-Methods')) {
        headers['Access-Control-Allow-Methods'] = 'OPTIONS, GET, DELETE, POST, PUT, HEAD, PATCH';
    }
    // the header Access-Control-Request-Headers is echoed back as the header Access-Control-Allow-Headers if it is present in the HTTP request.
    // Otherwise, a default value is generated.
    if (!headers.hasOwnProperty['Access-Control-Allow-Headers']) {
        headers['Access-Control-Allow-Headers'] = 'Authorization, Origin, X - Requested - With, Content - Type, Accept, User - Agent';
        if (typeof req.headers['Access-Control-Request-Headers'] !== "undefined") {
            headers['Access-Control-Allow-Headers'] = req.headers['Access-Control-Request-Headers'];
        }
    }

    res.header(headers).status(statusCode).send(body);
    DEBUG.functionEnd();
}

function PlatformKnativeImpl(platformFactory) {
    DEBUG.functionStart();
    DEBUG.dumpObject(platformFactory, "platformFactory" );

    var http_method = {
        get: 'GET',
        post: 'POST',
        put: 'PUT',
        delete: 'DELETE',
        options: 'OPTIONS',
    };

    const DEFAULT_METHOD = [ 'POST' ];

    // Provide access to common runtime services
    var service = platformFactory.service;

    // TODO: Should we use app.WrapEndpoint()?
    this.run = function(req, res) {

        try {
            DEBUG.dumpObject(service.initialized(),"service.initialized()");

            // Do not process requests with init. data if this is not a "stem" cell
            if (hasInitData(req) && !isStemCell(process.env))
                throw ("Cannot initialize a runtime with a dedicated function.");

            // If this is a dedicated, uninitialized runtime, then copy INIT data from env. into the request
            if( !isStemCell(process.env) && !service.initialized()){
                let body = req.body || {};
                body.init = createInitDataFromEnvironment(process.env);
            }

            // Different pre-processing logic based upon request data needed due Promise behavior
            if(hasInitData(req) && hasActivationData(req)) {
                // Request has both Init and Run (activation) data
                preProcessRequest(req);
                // Invoke the OW "init" entrypoint
                service.initCode(req).then(function () {
                    // delete any INIT data (e.g., code, raw, etc.) from the 'value' data before calling run().
                    removeInitData(req.body);
                    // Invoke the OW "run" entrypoint
                    service.runCode(req).then(function (result) {
                        postProcessResponse(req, result, res)
                    });
                }).catch(function (error) {
                    console.error(error);
                    if (typeof error.code === "number" && typeof error.response !== "undefined") {
                        res.status(error.code).json(error.response);
                    } else {
                        console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                        res.status(500).json({ error: "Internal error during function execution." });
                    }
                });
            } else if(hasInitData(req)){
                // Request has ONLY Init data
                preProcessRequest(req);
                // Invoke the OW "init" entrypoint
                service.initCode(req).then(function (result) {
                    res.status(result.code).send(result.response);
                }).catch(function (error) {
                    console.error(error);
                    if (typeof error.code === "number" && typeof error.response !== "undefined") {
                        res.status(error.code).json(error.response);
                    } else {
                        console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                        res.status(500).json({ error: "Internal error during function execution." });
                    }
                });
            } else if(hasActivationData(req)){
                // Request has ONLY Run (activation) data
                preProcessRequest(req);
                // Invoke the OW "run" entrypoint
                service.runCode(req).then(function (result) {
                    postProcessResponse(req, result, res)
                }).catch(function (error) {
                    console.error(error);
                    if (typeof error.code === "number" && typeof error.response !== "undefined") {
                        res.status(error.code).json(error.response);
                    } else {
                        console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                        res.status(500).json({ error: "Internal error during function execution." });
                    }
                });
            } else {
                preProcessRequest(req);
                // Invoke the OW "run" entrypoint
                service.runCode(req).then(function (result) {
                    postProcessResponse(req, result, res)
                }).catch(function (error) {
                    console.error(error);
                    if (typeof error.code === "number" && typeof error.response !== "undefined") {
                        res.status(error.code).json(error.response);
                    } else {
                        console.error("[wrapEndpoint]", "invalid errored promise", JSON.stringify(error));
                        res.status(500).json({ error: "Internal error during function execution." });
                    }
                });
            }

        } catch (e) {
            res.status(500).json({error: "internal error during request processing."})
        }
    };

    // TODO: the 'httpMethods' var should not alternatively store string and string[] types
    this.registerHandlers = function(app, platform) {
        var httpMethods = process.env.__OW_HTTP_METHODS;
        // default to "[post]" HTTP method if not defined
        if (typeof httpMethods === "undefined") {
            console.error("__OW_HTTP_METHODS is undefined; defaulting to '[post]' ...");
            httpMethods = DEFAULT_METHOD;
        } else {
            if (httpMethods.startsWith('[') && httpMethods.endsWith(']')) {
                httpMethods = httpMethods.substr(1, httpMethods.length);
                httpMethods = httpMethods.substr(0, httpMethods.length -1);
                httpMethods = httpMethods.split(',');
            }
        }
        // default to "[post]" HTTP method if specified methods are not valid
        if (!Array.isArray(httpMethods) || !Array.length) {
            console.error("__OW_HTTP_METHODS is undefined; defaulting to '[post]' ...");
            httpMethods = DEFAULT_METHOD;
        }

        httpMethods.forEach(function (method) {
            switch (method.toUpperCase()) {
                case http_method.get:
                    app.get('/', platform.run);
                    break;
                case http_method.post:
                    app.post('/', platform.run);
                    break;
                case http_method.put:
                    app.put('/', platform.run);
                    break;
                case http_method.delete:
                    app.delete('/', platform.run);
                    break;
                case http_method.options:
                    app.options('/', platform.run);
                    break;
                default:
                    console.error("Environment variable '__OW_HTTP_METHODS' has an unrecognized value (" + method + ").");
            }
        });
    };
    DEBUG.functionEnd();
}

module.exports = PlatformKnativeImpl;
