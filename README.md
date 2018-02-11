# Developer tools for OpenWhisk

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-devtools.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-devtools)

This repository is part of [Apache OpenWhisk](http://openwhisk.incubator.apache.org/) and provides developer tools that help with local development, testing and operation of OpenWhisk.

## Subprojects

* [docker-compose](docker-compose/README.md) allows testing OpenWhisk locally, using Docker Compose. This is ideal if you are contributing to core development
* [node-local](node-local/README.md) allows testing individual OpenWhisk functions locally, using only node.js. This is ideal if you are writing node.js functions to run in OpenWhisk, but need to emulate some of OpenWhisk's behavior in creating `params` and expecting promises.
* [maven-java](maven-java/README.md) allows testing OpenWhisk Java Actions. This shows how to package the function dependencies e.g. external jar.

## Travis builds

Each tool in this repository has to provide travis build scripts inside a `.travis` folder.
The folder should define 2 scripts:
* `setup.sh` - invoked during `before_install` phase
* `build.sh` - invokes during `script` phase

For an example check out [docker-compose/.travis](docker-compose/.travis) folder.
