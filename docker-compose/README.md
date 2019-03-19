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

# How to setup OpenWhisk with Docker Compose

[![Build Status](https://travis-ci.org/apache/incubator-openwhisk-devtools.svg?branch=master)](https://travis-ci.org/apache/incubator-openwhisk-devtools)

An easy way to try OpenWhisk locally is to use Docker Compose.

#### Prerequisites

The following are required to build and deploy OpenWhisk with Docker Compose:

- Mac OSX:
    - [Docker for Mac](https://www.docker.com/docker-mac) - only this currently works on Mac OSX
      + Install via homebrew: `brew cask install docker`
- Other Systems:
    - [Docker 1.13+](https://www.docker.com/products/docker)
    - [Docker Compose 1.6+](https://docs.docker.com/compose/install/)
- [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

These ports must be available:

- `80`, `443`, `9000`, `9001`, and `9090` for the API Gateway
- `6379` for Redis
- `2181` for Zookeeper
- `5984` for CouchDB
- `8085`, `9333` for OpenWhisk's Invoker
- `8888`, `9222` for OpenWhisk's Controller
- `9092` for Kafka
- `8001` for Kafka Topics UI

# Quick Start

```bash
make quick-start
```

This command downloads the `master` branch from the [OpenWhisk](https://github.com/openwhisk/openwhisk) repo, it  builds OpenWhisk, the docker containers, it starts the system and it executes a simple `hello-world` function.
At the end of the execution it prints the output of the function:
```javascript
{
    "payload": "Hello, World!"
}
```

If `OPENWHISK_PROJECT_HOME` variable is set ( i.e. `OPENWHISK_PROJECT_HOME=/path/to/openwhisk make quick-start`)
then the command skips downloading the sources and uses instead the source code found in the `OPENWHISK_PROJECT_HOME` folder.
This is useful for working with a local clone, making changes to the code, and run it with `docker-compose`.

This is the set of environment variables that can be set:

* `OPENWHISK_PROJECT_HOME` - a checkout of [openwhisk](https://github.com/apache/incubator-openwhisk)
* `OPENWHISK_VERSION` - defaults to `master` but can be set to [releases](https://github.com/apache/incubator-openwhisk/releases) such as `0.9.0-incubating`
* `OPENWHISK_CATALOG_HOME` - a checkout of [openwhisk-catalog](https://github.com/apache/incubator-openwhisk-catalog)
* `WSK_CLI` - the directory where the [`wsk` command line tool](https://github.com/apache/incubator-openwhisk-cli) can be found
* `DOCKER_IMAGE_PREFIX` - the prefix of the docker images used for actions. If you are building and testing checkouts of runtimes locally, then consider setting this to `whisk`.

Note that these are all optional and only need to be set if you have a local checkout that you want to use.

## Updating OpenWhisk Invoker or Controller

To update the OpenWhisk Invoker or Controller without restarting everything, run:

```bash
make restart-invoker
```
This command destroys the running Invoker instance, waits for the controller to figure out the invoker is `down`, then it starts a new Invoker, also waiting until it's marked as `up`.

To do the same with the controller run:

```bash
make restart-controller
```


## Troubleshooting

* ```error: Authenticated user does not have namespace 'guest'; set command failed: Get https://localhost:443/api/v1/namespaces: dial tcp [::1]:443: getsockopt: connection refused```

  Make sure nothing runs on the above listed ports. Port 80 might be commonly in use by a local httpd for example. On a Mac, use `sudo lsof -i -P` to find out what process runs on a port. You can turn off Internet Sharing under System Settings > Sharing, or try `sudo /usr/sbin/apachectl stop` to stop httpd.

* ```error: Unable to invoke action 'hello': There was an internal server error. (code 5)```

  Look at the logs in `~/tmp/openwhisk` especially `~/tmp/openwhisk/controller/logs/controller-local_logs.log` that might give more information. This can be an indication that the docker environment doesn't work properly (and on Mac you might need to switch to use [Docker for Mac](https://www.docker.com/docker-mac).

* Check the [issue tracker](https://github.com/apache/incubator-openwhisk-devtools/issues) for more.

# Pull and build local OpenWhisk core images

You can pull pre-built image
```bash
make docker-pull
```

This command pulls the docker images for local testing and development.

```bash
make docker-build
```

This command builds the opewnhisk core docker images for local testing and development.


# Start

```bash
make run
```

This command starts OpenWhisk by calling `docker-compose up`, it initializes the database and the CLI.

# Stop

The following command stops the `docker-compose`:

```bash
make stop
```

To remove the stopped containers, clean the database files and the temporary files use:

 ```bash
 make destroy
 ```

# Running a hello-world function

Once OpenWhisk is up and running you can execute a `hello-world` function:

```bash
make hello-world
```

This command creates a new JS action, it invokes it, and then it deletes it.
  The javascript action is:
```javascript
function main(params) {
    var name = params.name || "World";
    return {payload: "Hello, " + name + "!"};
}
```
The result of the invocation should be printed on the terminal:
```
{
    "payload": "Hello, World!"
}
```

Here is a [tutorial on getting started with actions](https://github.com/IBM-Bluemix/openwhisk-workshops/tree/master/bootcamp#start-your-engines).

Note that these commands will use `-i` to bypass security check as we are running
it on localhost

## Install Catalog Packages

OpenWhisk has [numerous extra packages](https://github.com/apache/incubator-openwhisk-catalog) that are often installed into the `/whisk.system` namespace.

***These are not included by default with the devtools  `make quick-start` command.***

If you want to install these packages, run the following make command.

```bash
make add-catalog
```

Once the installation process has completed, you can check the `whisk.system` namespace to verify it those packages are now available.

```
wsk package list /whisk.system
```
## Updating Containers

If you want to pull new containers you can use `make pull` to update all the containers used in the docker-compose file.

## Install Feed Providers

OpenWhisk supports [feed providers](https://github.com/apache/incubator-openwhisk/blob/master/docs/feeds.md) for invoking triggers from external event sources.

***Feed provider packages are not included by default with the devtools  `make quick-start` command.***

Providers for the [`alarms`](https://github.com/apache/incubator-openwhisk-package-alarms), [`kafka`](https://github.com/apache/incubator-openwhisk-package-kafka) and [`cloudant`](https://github.com/apache/incubator-openwhisk-package-cloudant) feeds can be installed individually using the `make` command.

```bash
make create-provider-alarms
make create-provider-kafka
make create-provider-cloudant
```

Once the installation process has completed, you can check the `whisk.system` namespace to verify it the feed packages are now available.

```
wsk package list /whisk.system
```

## Logs

- OpenWhisk Controller - `~/tmp/openwhisk/controller/logs/`
- OpenWhisk Invoker - `~/tmp/openwhisk/invoker/logs/`
- `docker-compose` logs - `~/tmp/openwhisk/docker-compose.log`
- `docker-compose` feed provider logs - `~/tmp/openwhisk/docker-provider-compose.log`
- Feed provider instance logs - `~/tmp/openwhisk/<feed_name>provider`
- Action output such as stdout or console.log(): `wsk -i activation logs <activationId>`

## Debugging OpenWhisk Invoker and Controller
Both invoker and controller can be remotely debugged using any preferred IDE by setting these command line arguments for the remote JVM:

```
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=$port
```
These ports are available for debugging on `localhost`:
- `9333` for the Invoker
- `9222` for the Controller

Using IntelliJ:

Follow these steps to create a new `Run/Debug Configuration` for the `Invoker`. Same can be done for the `Controller`:
- Go to `Run` -> `Edit Configurations` -> `Add new Configuration` -> `Remote`
- Change port to `9333` and leave the host as `localhost`
- You can now debug the `Invoker` remotely by setting breakpoints inside the code

> Please be aware that changes done in the code are not automatically deployed. In order to be able to debug new changes, you need to rebuild the application and redeploy it with `docker-compose`.


## Custom Docker containers for actions

To start `docker-compose` with custom images used for running actions use the following 2 variables:

- `DOCKER_REGISTRY` - specify a custom docker registry. I.e ```DOCKER_REGISTRY=registry.example.com make quick-start```
- `DOCKER_IMAGE_PREFIX` - specify a custom image prefix. I.e. ```DOCKER_IMAGE_PREFIX=my-prefix make quick-start```

These 2 variable allow you to execute a JS action using the container `registry.example.com/my-prefix/nodejs6action`.

## Local Docker containers for controllers and invokers

By default this setup uses published images for controller and invokers from `openwhisk` namespace i.e.
`openwhisk/controller` and `openwhisk/invoker`. To make use of locally build images you can use `DOCKER_IMAGE_PREFIX`
variable i.e. `DOCKER_IMAGE_PREFIX=whisk make quick-start`

## Lean setup

To have a lean setup (no Kafka, Zookeeper and no Invokers as separate entities):

```bash
make lean
```
