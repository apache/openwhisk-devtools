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

# Developer tools for OpenWhisk

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-devtools.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-devtools)

This repository is part of [Apache OpenWhisk](http://openwhisk.incubator.apache.org/) and provides developer tools that help with local development, testing and operation of OpenWhisk.

## Subprojects

* [docker-compose](docker-compose/README.md) allows testing OpenWhisk locally, using Docker Compose. This is ideal if you are contributing to core development
* [java-action-archetype](java-action-archetype/README.md) This archetype helps to generate the Java Action template project.
* [node-local](node-local/README.md) allows testing individual OpenWhisk functions locally, using only node.js. This is ideal if you are writing node.js functions to run in OpenWhisk, but need to emulate some of OpenWhisk's behavior in creating `params` and expecting promises.
* [maven-java](maven-java/README.md) allows testing OpenWhisk Java Actions. This shows how to package the function dependencies e.g. external jar.
* [knative-build](knative-build/README.md) contains Knative Build Templates along with modified versions of their respective OpenWhisk Action Runtimes that can be used to Build and Serve Knative compatible applications on Kubernetes.
* [actionloop-starter-kit](actionloop-starter-kit/README.md) contains a starter kit to build a new runtime using the ActionLoop proxy used in Go, Swift, PHP, Python and Rust runtimes.

## Travis builds

Each tool in this repository has to provide travis build scripts inside a `.travis` folder.
The folder should define 2 scripts:
* `setup.sh` - invoked during `before_install` phase
* `build.sh` - invokes during `script` phase

For an example check out [docker-compose/.travis](docker-compose/.travis) folder.
