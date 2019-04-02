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
        // TODO: default to empty?
        var actionName = (typeof env.__OW_ACTION_NAME === 'undefined') ? "" : env.__OW_ACTION_NAME;
        var raw = (typeof env.__OW_ACTION_RAW === 'undefined') ? false : env.__OW_ACTION_RAW.toLowerCase() === "true";

        DEBUG.dumpObject(actionName, "Action name");
        DEBUG.dumpObject(main, "Action main");
        DEBUG.dumpObject(code, "Action code");
        DEBUG.dumpObject(binary, "Action binary");
        DEBUG.dumpObject(raw, "Action Raw");

        // Look for init data within the request (i.e., "stem cell" runtime, where code is injected by request)
        if (typeof(initdata) !== "undefined") {
            if (initdata.name && typeof initdata.name === 'string') {
                actionName = initdata.name;
            }
            if (initdata.main && typeof initdata.main === 'string') {
                main = initdata.main;
            }
            if (initdata.code && typeof initdata.code === 'string') {
                code = initdata.code;
            }
            if (initdata.binary) {
                if (typeof initdata.binary === 'boolean') {
                    binary = initdata.binary;
                } else {
                    throw ("Invalid Init. data; expected boolean for key 'binary'.");
                }
            }
            if (initdata.raw ) {
                if (typeof initdata.raw === 'boolean') {
                    raw = initdata.raw;
                } else {
                    throw ("Invalid Init. data; expected boolean for key 'raw'.");
                }
            }
        }

        // Move the init data to the request body under the "value" key.
        // This will allow us to reuse the "openwhisk" /init route handler function
        valuedata.main = main;
        valuedata.code = code;
        valuedata.binary = binary;
        valuedata.raw = raw;

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
        DEBUG.dumpObject(valuedata.raw, "valuedata.raw");

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
 * Pre-process HTTP request details, send them as parameters to the action input argument
 * __ow_method, __ow_headers, __ow_path, __ow_user, __ow_body, and __ow_query
 */
function preProcessHTTPContext(req, valueData) {
    DEBUG.functionStart();
    try {
        if (valueData.raw) {
            if (typeof req.body.value === "string" && req.body.value !== undefined) {
                valueData.__ow_body = req.body.value;
            } else {
                const body = Object.assign({}, req.body.value);
                // delete main, binary, raw, and code from the body before sending it as an action argument
                delete body.main;
                delete body.code;
                delete body.binary;
                delete body.raw;
                var bodyStr = JSON.stringify(body);
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
    try {
        // Get or create valid references to the various data we might encounter
        // in a request such as Init., Activation and function parameter data.
        let body = req.body || {};
        let valueData = body.value || {};
        let initData = body.init || {};
        let activationData = body.activation || {};
        let env = process.env || {};

        // process initialization (i.e., "init") data
        preProcessInitData(env, initData, valueData, activationData);

        preProcessHTTPContext(req, valueData);

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

    //When the content-type is defined, check if the response is binary data or
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

            // Process request and process env. variables to provide them in the manner
            // an OpenWhisk Action expects them, as well as enable additional Http features.
            preProcessRequest(req);

            // Do not process requests with init. data if this is not a "stem" cell
            if (hasInitData(req) && !isStemCell(process.env))
                throw ("Cannot initialize a runtime with a dedicated function.");

            service.initCode(req).then(function () {
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
        } catch (e) {
            res.status(500).json({error: "internal error during function initialization."})
        }
    };

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
                httpMethods = httpMethods.split(',')
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
