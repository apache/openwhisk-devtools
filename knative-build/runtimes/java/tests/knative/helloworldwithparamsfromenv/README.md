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

# Hello World with Params from Env. Test for OpenWhisk Java Runtime using Knative

## Running the test using the "Curl" command

Depending on the value you set in [buildtemplate.yaml](../../buildtemplate.yaml) for the ```OW_RUNTIME_PLATFORM``` parameter, you will need to invoke different endpoints to execute the test.

### Running with OW_RUNTIME_PLATFORM set to "knative"

#### Invoke / endpoint on the Service

```
curl -H "Host: java-helloworld-with-params-from-env.default.example.com" -X POST http://localhost/
```

#### Initialize the runtime

You have an option to initialize the runtime with the function and other configuration data if its not initialized (i.e. built using [build-without-code.yaml.tmpl](build-without-code.yaml.tmpl))

```
curl -H "Host: java-helloworld-with-params-from-env.default.example.com" -d "@knative-data-init.json" -H "Content-Type: application/json" http://localhost/

{"OK":true}
```

#### Run the function

Execute the function.

```
curl -H "Host: java-helloworld-with-params-from-env.default.example.com" -d "@knative-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/

{"payload":"Hello Jess from OK!"};
```

### Running with OW_RUNTIME_PLATFORM set to "openwhisk"

#### Initialize the runtime

Initialize the runtime with the function and other configuration data using the ```/init``` endpoint.

```
curl -H "Host: java-helloworld-with-params-from-env.default.example.com" -d "@openwhisk-data-init.json" -H "Content-Type: application/json" http://localhost/init

{"OK":true}
```

#### Run the function

Execute the function using the ```/run``` endpoint.

```
curl -H "Host: java-helloworld-with-params-from-env.default.example.com" -d "@openwhisk-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/run

{"payload":"Hello Jess from OK!"};
```

---

## Updating the testcase

### Create the jar file

```
$ jar cf hello.jar Hello.java
```

### Base64 encode the jar file
```
$ base64 hello.jar > hello.jar.base64
```

hello.jar.base64 then contains:

```
UEsDBBQACAgIAGSSp04AAAAAAAAAAAAAAAAJAAQATUVUQS1JTkYv/soAAAMAUEsHCAAAAAACAAAAAAAAAFBLAwQUAAgICABkkqdOAAAAAAAAAAAAAAAAFAAAAE1FVEEtSU5GL01BTklGRVNULk1G803My0xLLS7RDUstKs7Mz7NSMNQz4OVyLkpNLElN0XWqBAlY6BnEGxkYKWi4JudkFhSnKvgXpOZ5WWrycvFyAQBQSwcIMFMkp0EAAABBAAAAUEsDBBQACAgIAKSRp04AAAAAAAAAAAAAAAAKAAAASGVsbG8uamF2YW1TS1PbMBC++1dsfQqQOp0ey3BwgQxuGaeDQxmOir1R1NqSKsmYDMN/764f4Jk2hyRar77XrlenEZzCrSpRe6wgGAgHhNSKkn4Ksw+dcAhr0+pKBGU0LNJifQJ0RAdGIxgHjXHIKKXRwaldG6hWD4ggpENsUAefABSIPXy+2WaX17BXNUKl/HCJ2DsVDgwUDspDZ9xv2BOUqCrF1KIGpanQDEIcSuEqpSXx2qNT8hDAdBqdPyibMMyWnRTrSYsfcHtW8vlo2tHGzPEYxBJ+Eg6zfE4+MdSCe+LxaXxyDke63YgjaBOg9TiDxucSbSCppKuxtRK6xJmzNw7K43EEMbsgqF/0TsDs520gAl3ku/w5hGC/rFZd1yWiV5wYJ1eTwdUtxZoX1x8H1XzpXtfoPYX1p1WOIt4dQVhSVYodaa1FxwPsh9QPn1R0jtLWcgl+nD7DzKf0HtokkazPGyg2oSFOC8iKGL6mRVYsGeQh295s7rfwkN7dpfk2uy5gcweXm/wq22abnE5rSPNH+J7lV0tAiox48Nk6dkAyFceJVT/baZUmCbwofPYWS7VXJVnTshUSQZondJr3xKJrlOexehJYMUytGhX6ffL/+mKiVRQRrXGBp5lIY2SNifRGJ9/oa7P7hWU4j2y7o0ihrAUpvcG6NvASAYxlzwwlvF+goSu9mJ2Fk/6kv0IvCeVIYrVoEC6gOPqARIwB9dMi5iqt37zR1qL8T2dfnlpnVBSmNZzYBWjsZk8WY+/UkNB798MZCi0cFzFvCK9FvIR4MBjD2SDyjP7unWn6yqCGSh/iN7zQOv0Gy8XX6DX6C1BLBwjRtzqCagIAAHkEAABQSwECFAAUAAgICABkkqdOAAAAAAIAAAAAAAAACQAEAAAAAAAAAAAAAAAAAAAATUVUQS1JTkYv/soAAFBLAQIUABQACAgIAGSSp04wUySnQQAAAEEAAAAUAAAAAAAAAAAAAAAAAD0AAABNRVRBLUlORi9NQU5JRkVTVC5NRlBLAQIUABQACAgIAKSRp07RtzqCagIAAHkEAAAKAAAAAAAAAAAAAAAAAMAAAABIZWxsby5qYXZhUEsFBgAAAAADAAMAtQAAAGIDAAAAAA==
```

### Update value for "code" key in test file

Any file that contains an "init" payload will need to be updated. For example, using ```payload-knative-init-run.http``` as an example:

```
POST http://localhost:8080/ HTTP/1.1
content-type: application/json

{
  "init": {
    "name" : "java-helloworld-with-params-from-env",
    "main" : "Hello",
    "binary": true,
    "code" : "UEsDBBQACAgIAGSSp04AAAAAAAAAAAAAAAAJAAQATUVUQS1JTkYv/soAAAMAUEsHCAAAAAACAAAAAAAAAFBLAwQUAAgICABkkqdOAAAAAAAAAAAAAAAAFAAAAE1FVEEtSU5GL01BTklGRVNULk1G803My0xLLS7RDUstKs7Mz7NSMNQz4OVyLkpNLElN0XWqBAlY6BnEGxkYKWi4JudkFhSnKvgXpOZ5WWrycvFyAQBQSwcIMFMkp0EAAABBAAAAUEsDBBQACAgIAKSRp04AAAAAAAAAAAAAAAAKAAAASGVsbG8uamF2YW1TS1PbMBC++1dsfQqQOp0ey3BwgQxuGaeDQxmOir1R1NqSKsmYDMN/764f4Jk2hyRar77XrlenEZzCrSpRe6wgGAgHhNSKkn4Ksw+dcAhr0+pKBGU0LNJifQJ0RAdGIxgHjXHIKKXRwaldG6hWD4ggpENsUAefABSIPXy+2WaX17BXNUKl/HCJ2DsVDgwUDspDZ9xv2BOUqCrF1KIGpanQDEIcSuEqpSXx2qNT8hDAdBqdPyibMMyWnRTrSYsfcHtW8vlo2tHGzPEYxBJ+Eg6zfE4+MdSCe+LxaXxyDke63YgjaBOg9TiDxucSbSCppKuxtRK6xJmzNw7K43EEMbsgqF/0TsDs520gAl3ku/w5hGC/rFZd1yWiV5wYJ1eTwdUtxZoX1x8H1XzpXtfoPYX1p1WOIt4dQVhSVYodaa1FxwPsh9QPn1R0jtLWcgl+nD7DzKf0HtokkazPGyg2oSFOC8iKGL6mRVYsGeQh295s7rfwkN7dpfk2uy5gcweXm/wq22abnE5rSPNH+J7lV0tAiox48Nk6dkAyFceJVT/baZUmCbwofPYWS7VXJVnTshUSQZondJr3xKJrlOexehJYMUytGhX6ffL/+mKiVRQRrXGBp5lIY2SNifRGJ9/oa7P7hWU4j2y7o0ihrAUpvcG6NvASAYxlzwwlvF+goSu9mJ2Fk/6kv0IvCeVIYrVoEC6gOPqARIwB9dMi5iqt37zR1qL8T2dfnlpnVBSmNZzYBWjsZk8WY+/UkNB798MZCi0cFzFvCK9FvIR4MBjD2SDyjP7unWn6yqCGSh/iN7zQOv0Gy8XX6DX6C1BLBwjRtzqCagIAAHkEAABQSwECFAAUAAgICABkkqdOAAAAAAIAAAAAAAAACQAEAAAAAAAAAAAAAAAAAAAATUVUQS1JTkYv/soAAFBLAQIUABQACAgIAGSSp04wUySnQQAAAEEAAAAUAAAAAAAAAAAAAAAAAD0AAABNRVRBLUlORi9NQU5JRkVTVC5NRlBLAQIUABQACAgIAKSRp07RtzqCagIAAHkEAAAKAAAAAAAAAAAAAAAAAMAAAABIZWxsby5qYXZhUEsFBgAAAAADAAMAtQAAAGIDAAAAAA=="
  },
  "activation": {
    "namespace": "default",
    "action_name": "java-helloworld-with-params-from-env",
    "api_host": "",
    "api_key": "",
    "activation_id": "",
    "deadline": "4102498800000"
  },
  "value": {
    "name" : "Joe",
    "place" : "TX"
  }
}

###
```
