# Developer tools for OpenWhisk

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-devtools.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-devtools)

This repository is part of [Apache OpenWhisk](http://openwhisk.incubator.apache.org/) and provides developer tools that help with local development, testing and operation of OpenWhisk.

## Subprojects

* [docker-compose](docker-compose/README.md) allows testing OpenWhisk locally, using Docker Compose. This is ideal if you are contributing to core development
* [node-local](node-local/README.md) allows testing individual OpenWhisk functions locally, using only node.js. This is ideal if you are writing node.js functions to run in OpenWhisk, but need to emulate some of OpenWhisk's behavior in creating `params` and expecting promises.
* *java-maven* tooling to support building / deploying Java actions in OpenWhisk
  * [action-archetype](java-maven/action-archetype) Archetype for creating a Java Action project using Apache Maven
  * [annotations](java-maven/annotations) Java annotations to indicate OpenWhisk Actions, Packages, Rules and Triggers 
  * [parent](java-maven/parent) provides a baseline Maven configuration for Maven-based OpenWhisk sub-projects
  * [update-maven-plugin](java-maven/update-maven-plugin) Apache Maven plugin to read the [annotations](java-maven/annotations) and automatically deploying the Actions, Packages, Rules and Trigger to OpenWhisk
* [maven-java-examplea](maven-java-example/README.md) shows how to package the function dependencies e.g. external jar.
* [java-local](java-local) allows testing OpenWhisk Java Actions

## Travis builds

Each tool in this repository has to provide travis build scripts inside a `.travis` folder.
The folder should define 2 scripts:
* `setup.sh` - invoked during `before_install` phase
* `build.sh` - invokes during `script` phase

For an example check out [docker-compose/.travis](docker-compose/.travis) folder.
