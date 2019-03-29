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

function PlatformOpenWhiskImpl(platformFactory, svc, cfg) {
    DEBUG.functionStart();
    DEBUG.dumpObject(platformFactory, "platformFactory");
    DEBUG.dumpObject(svc, "Service");
    DEBUG.dumpObject(cfg, "Config");

    // Provide access to common runtime services
    // TODO validate service is valid or err out
    var service = svc;

    this.registerHandlers = function(app, platform) {
        app.post('/init', this.wrapEndpoint(service.initCode));
        app.post('/run', this.wrapEndpoint(service.runCode));
    };
    DEBUG.functionEnd();
}

module.exports = PlatformOpenWhiskImpl;