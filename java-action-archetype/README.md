# Maven Archetype for Java Action

This archetype helps to generate the Java Action template project.

## Pre-requisite

The following softwares are required to build and deploy a Java Action to OpenWhisk:

* (Maven v3.3.x)[https://maven.apache.org] or above
* Java 8 or above

[WSK CLI](https://github.com/apache/incubator-openwhisk/blob/master/docs/cli.md) is configured 

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