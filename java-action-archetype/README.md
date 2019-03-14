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

# Maven Archetype for Java Action

This archetype helps to generate the Java Action template project.

## Pre-requisite

The following softwares are required to build and deploy a Java Action to OpenWhisk:

* (Maven v3.3.x)[https://maven.apache.org] or above
* Java 8 or above

[WSK CLI](https://github.com/apache/incubator-openwhisk/blob/master/docs/cli.md) is configured

## Install the archetype
```sh
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
```

## Generate project

```sh
mvn archetype:generate \
  -DarchetypeGroupId=org.apache.openwhisk.java \
  -DarchetypeArtifactId=java-action-archetype \
  -DarchetypeVersion=1.0-SNAPSHOT \
  -DgroupId=com.example \
  -DartifactId=demo-function
```

## Deploying function to OpenWhisk

The following step shows how to deploy the function to OpenWhisk

```sh
cd demo-function
mvn clean install
wsk action create demo target/demo-function.jar --main com.example.FunctionApp
```

After successful deployment of the function, we can invoke the same via `wsk action invoke demo --result` to see the response as:

```json
{"greetings":  "Hello! Welcome to OpenWhisk" }
```
