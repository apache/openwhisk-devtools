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

# Hello World Test for OpenWhisk NodeJS Runtime using Knative

## Running the test using the "Curl" command

Depending on the value you set in [buildtemplate.yaml](../../buildtemplate.yaml) for the ```OW_RUNTIME_PLATFORM``` parameter, you will need to invoke different endpoints to execute the test.

### Running with OW_RUNTIME_PLATFORM set to "knative"

#### Invoke / endpoint on the Service

```
curl -H "Host: nodejs-helloworld.default.example.com" -X POST http://localhost/
```

#### Initialize the runtime

You have an option to initialize the runtime with the function and other configuration data if its not initialized (i.e. built using [build-without-code.yaml.tmpl](build-without-code.yaml.tmpl))

```
curl -H "Host: nodejs-helloworld.default.example.com" -d "@knative-data-init.json" -H "Content-Type: application/json" http://localhost/

{"OK":true}
```

#### Run the function

Execute the function.

```
curl -H "Host: nodejs-helloworld.default.example.com" -d "@knative-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/

{"payload":"Hello World!"};
```

### Running with OW_RUNTIME_PLATFORM set to "openwhisk"

#### Initialize the runtime

Initialize the runtime with the function and other configuration data using the ```/init``` endpoint.

```
curl -H "Host: nodejs-helloworld.default.example.com" -d "@openwhisk-data-init.json" -H "Content-Type: application/json" http://localhost/init

{"OK":true}
```

#### Run the function

Execute the function using the ```/run``` endpoint.

```
curl -H "Host: nodejs-helloworld.default.example.com" -d "@openwhisk-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/run

{"payload":"Hello World!"}
```
