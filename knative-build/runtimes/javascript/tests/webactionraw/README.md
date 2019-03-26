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

# Raw Web Action Test for OpenWhisk NodeJS Runtime using Knative

## Running the test using the `curl` command

Depending on the value you set in [buildtemplate.yaml](../../buildtemplate.yaml) for the ```OW_RUNTIME_PLATFORM``` parameter, you will need to invoke different endpoints to execute the test.

### Running with OW_RUNTIME_PLATFORM set to "knative"

#### Invoke / endpoint on the Service

```
curl -H "Host: nodejs-web-action-raw.default.example.com" -X POST http://localhost/
{
   "response":{
      "__ow_body":"eyJuYW1lIjoiSm9lIn0=",
      "__ow_query":{
      },
      "__ow_user":"",
      "__ow_method":"POST",
      "__ow_headers":{
         "host":"localhost",
         "user-agent":"curl/7.54.0",
         "accept":"*/*",
         "content-type":"application/json",
         "content-length":"394"
      },
      "__ow_path":""
   }
}
```

### Running with OW_RUNTIME_PLATFORM set to "openwhisk"

#### Initialize the runtime

Initialize the runtime with the function and other configuration data using the ```/init``` endpoint.

```
curl -H "Host: nodejs-web-aciton-raw.default.example.com" -d "@data-init.json" -H "Content-Type: application/json" http://localhost/init

{"OK":true}
```

#### Run the function

Execute the function using the ```/run``` endpoint.

```
curl -H "Host: nodejs-web-action-raw.default.example.com" -d "@data-run.json" -H "Content-Type: application/json" -X POST http://localhost/run
{
   "response":{
      "name":"Joe"
   }
}
```

**Note**: OpenWhisk controller plays an important role in handling web actions and that's why lacking `__ow_*` parameters from the response.
