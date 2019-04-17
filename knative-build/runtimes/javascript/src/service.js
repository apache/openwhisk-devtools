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

var NodeActionRunner = require('../runner');

function NodeActionService(config) {

    var Status = {
        ready: 'ready',
        starting: 'starting',
        running: 'running',
        stopped: 'stopped',
    };

    // TODO: save the entire configuration for use by any of the route handlers
    var status = Status.ready;
    var ignoreRunStatus = config.allowConcurrent === undefined ? false : config.allowConcurrent.toLowerCase() === 'true';
    var server = undefined;
    var userCodeRunner = undefined;
    DEBUG.trace('Initialize: status=' + status);
    DEBUG.trace('Initialize: ignoreRunStatus=' + ignoreRunStatus);

    function setStatus(newStatus) {
        DEBUG.functionStart('newStatus=' + newStatus + ' (oldStatus=' + status + ')');
        if (status !== Status.stopped) {
            status = newStatus;
        }
        DEBUG.functionEnd('status=' + status);
    }

    /**
     * An ad-hoc format for the endpoints returning a Promise representing,
     * eventually, an HTTP response.
     *
     * The promised values (whether successful or not) have the form:
     * { code: int, response: object }
     *
     */
    function responseMessage(code, response) {
        return { code: code, response: response };
    }

    function errorMessage(code, errorMsg) {
        return responseMessage(code, { error: errorMsg });
    }

    /**
     * Indicates if we have been initialized which is determined by if we have
     * created a NodeActionRunner.
     * @returns {boolean}
     */
    this.initialized = function isInitialized(){
        return (typeof userCodeRunner !== 'undefined');
    };

    /**
     * Starts the server.
     *
     * @param app express app
     */
    this.start = function start(app) {
        DEBUG.functionStart();
        server = app.listen(config.port, function() {
            var host = server.address().address;
            var port = server.address().port;
            DEBUG.trace('listening: host: [' + host + '], port: [' + port + ']', 'Express (callback)');
        });

        // This is required as http server will auto disconnect in 2 minutes, this to not auto disconnect at all
        server.timeout = 0;
        DEBUG.dumpObject(server, 'server');
        DEBUG.functionEnd();
    };

    /** Returns a promise of a response to the /init invocation.
     *
     *  req.body = { main: String, code: String, binary: Boolean }
     */
    this.initCode = function initCode(req) {
        DEBUG.functionStart('status=' + status);

        if (status === Status.ready && userCodeRunner === undefined) {

            setStatus(Status.starting);

            var body = req.body || {};
            var message = body.value || {};
            DEBUG.dumpObject(body, 'body');
            DEBUG.dumpObject(message, 'message');

            if (message.main && message.code && typeof message.main === 'string' && typeof message.code === 'string') {
                return doInit(message).then(function(result) {
                    setStatus(Status.ready);
                    DEBUG.dumpObject(result, 'result', 'initCode');
                    DEBUG.functionEndSuccess('[200] { OK: true }', 'initCode');
                    return responseMessage(200, { OK: true });
                }).catch(function(error) {
                    setStatus(Status.stopped);
                    var errStr = 'Initialization has failed due to: ' + error.stack ? String(error.stack) : error;
                    DEBUG.functionEndError('[502] ' + errStr, 'initCode');
                    return Promise.reject(errorMessage(502, errStr));
                });
            } else {
                setStatus(Status.ready);
                var msg = 'Missing main/no code to execute.';
                DEBUG.functionEndError('[403] ' + msg);
                return Promise.reject(errorMessage(403, msg));
            }
        } else if (userCodeRunner !== undefined) {
            var msg = 'Cannot initialize the action more than once.';
            console.error('Internal system error:', msg);
            DEBUG.functionEndError('[403] ' + msg);
            return Promise.reject(errorMessage(403, msg));
        } else {
            var msg = 'System not ready, status is ' + status + '.';
            console.error('Internal system error:', msg);
            DEBUG.functionEndError('[403] ' + msg);
            return Promise.reject(errorMessage(403, msg));
        }
    };

    /**
     * Returns a promise of a response to the /exec invocation.
     * Note that the promise is failed if and only if there was an unhandled error
     * (the user code threw an exception, or our proxy had an internal error).
     * Actions returning { error: ... } are modeled as a Promise successful resolution.
     *
     * req.body = { value: Object, meta { activationId : int } }
     */
    this.runCode = function runCode(req) {
        DEBUG.functionStart('status=' + status);
        DEBUG.dumpObject(req, 'request');
        if (status === Status.ready) {
            if (!ignoreRunStatus) {
                setStatus(Status.running);
            }

            return doRun(req).then(function(result) {
                if (!ignoreRunStatus) {
                    setStatus(Status.ready);
                }
                DEBUG.dumpObject(result, 'result', 'runCode');
                if (typeof result !== 'object') {
                    DEBUG.functionEndError('[502] The action did not return a dictionary.', 'runCode');
                    return errorMessage(502, 'The action did not return a dictionary.');
                } else {
                    DEBUG.functionEndSuccess('[200] result: ' + result, 'runCode');
                    return responseMessage(200, result);
                }
            }).catch(function(error) {
                var msg = 'An error has occurred: ' + error;
                setStatus(Status.stopped);
                DEBUG.functionEndError('[502]: ' + msg);
                return Promise.reject(errorMessage(502, msg));
            });
        } else {
            var msg = 'System not ready, status is ' + status + '.';
            console.error('Internal system error:', msg);
            DEBUG.functionEndError('[403] ' + msg);
            return Promise.reject(errorMessage(403, msg));
        }
    };

    function doInit(message) {
        userCodeRunner = new NodeActionRunner();

        DEBUG.functionStart();
        DEBUG.dumpObject(message, 'message');
        return userCodeRunner.init(message).then(function(result) {
            // 'true' has no particular meaning here. The fact that the promise
            // is resolved successfully in itself carries the intended message
            // that initialization succeeded.
            DEBUG.functionEndSuccess('userCodeRunner.init() Success');
            return true;
        }).catch(function(error) {
            // emit error to activation log then flush the logs as this
            // is the end of the activation
            console.error('Error during initialization:', error);
            writeMarkers();
            DEBUG.functionEndError('userCodeRunner.init() Error: ' + error);
            return Promise.reject(error);
        });
    }

    function doRun(req) {
        DEBUG.functionStart();
        DEBUG.dumpObject(req, 'request');
        var msg = req && req.body || {};
        DEBUG.dumpObject(msg, 'msg');
        DEBUG.trace('Adding process environment variables:');
        // Move per-activation keys to process env. vars with __OW_ (reserved) prefix
        Object.keys(msg).forEach(
            function(k) {
                if (typeof msg[k] === 'string' && k !== 'value'){
                    var envVariable = '__OW_' + k.toUpperCase();
                    process.env['__OW_' + k.toUpperCase()] = msg[k];
                    DEBUG.dumpObject(process.env[envVariable], envVariable, 'doRun');
                }
            }
        );

        return userCodeRunner.run(msg.value).then(function(result) {
            if (typeof result !== 'object') {
                console.error('Result must be of type object but has type "' + typeof result + '":', result);
            }
            writeMarkers();
            DEBUG.functionEndSuccess('userCodeRunner.run(): Success (' + result + ')', 'doRun');
            return result;
        }).catch(function(error) {
            console.error(error);
            writeMarkers();
            DEBUG.functionEndError('userCodeRunner.run(): Error:' + error, 'doRun');
            return Promise.reject(error);
        });
    }

    function writeMarkers() {
        console.log('XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX');
        console.error('XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX');
    }
}

NodeActionService.getService = function(config) {
    return new NodeActionService(config);
};

module.exports = NodeActionService;
