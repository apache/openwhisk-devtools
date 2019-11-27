<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# OpenWhisk Runtimes for Knative

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

This repository contains tests that comprise the sample Java functions that are used to prepare the Java runtime
shared class cache.

## Test Manual build and execution

### Building

TBD

### Executing

#### OpenWhisk runtime build

```
curl -d "@openwhisk-data-init.json" -H "Content-Type: application/json" -X POST http://localhost:8080/init

curl -d "@openwhisk-data-run.json" -H "Content-Type: application/json" -X POST http://localhost:8080/run
```
