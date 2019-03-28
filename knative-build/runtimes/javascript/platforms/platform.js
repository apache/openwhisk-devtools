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

/**
 * Runtime platform factory
 *
 * This module is a NodeJS compatible version of a factory that will
 * produce an implementation module provides OpenWhisk Language
 * Runtime functionality and is able to register endpoints/handlers
 * allowing to host OpenWhisk Actions and process OpenWhisk Activations.
 */

var dbg = require('../utils/debug');
var DEBUG = new dbg();

// Export supported platform impls.
const PLATFORM_OPENWHISK = 'openwhisk';
const PLATFORM_KNATIVE =  'knative';

const SUPPORTED_PLATFORMS = [
    PLATFORM_OPENWHISK,
    PLATFORM_KNATIVE
];

module.exports = class PlatformFactory {

    /**
     *
     * @returns {string[]} List of supported platforms by their string ID
     */
    static get SUPPORTED_PLATFORMS() {
        return SUPPORTED_PLATFORMS;
    }

    static get PLATFORM_OPENWHISK() {
        return PLATFORM_OPENWHISK;
    }

    static get PLATFORM_KNATIVE() {
        return PLATFORM_KNATIVE;
    }

    /**
     * Object constructor
     * @param svc Runtime services
     * @param cfg Runtime configuration
     */
    constructor (svc, cfg) {
        DEBUG.dumpObject(svc,"svc");
        DEBUG.dumpObject(cfg,"cfg");
        this.service = svc;
        this.config = cfg;
    }

    /**
     * Instantiate a platform implementation
     * @param id Platform ID
     * @returns {PlatformImpl} Platform instance (interface), as best can be done with NodeJS
     */
    createPlatformImpl(id){
        DEBUG.dumpObject(id,"id");
        switch (id.toLowerCase()) {
            case PLATFORM_KNATIVE:
                var knPlatformImpl = require('./knative.js');

                // TODO remove first parm.
                var platform = new knPlatformImpl("knative", this.service, this.config);
                this.impl = platform;
                DEBUG.dumpObject(platform,"platform");
                break;
            case PLATFORM_OPENWHISK:
                app.post('/init', wrapEndpoint(this.service.initCode));
                app.post('/run', wrapEndpoint(this.service.runCode));
                break;
            default:
                console.error("Platform ID is not a known value (" + id + ").");
        }

        return this.impl;
    }
};
