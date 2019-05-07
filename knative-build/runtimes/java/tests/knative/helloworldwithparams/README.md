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

# Hello World with Params Test for OpenWhisk Java Runtime using Knative

## Running the test using the "Curl" command

Depending on the value you set in [buildtemplate.yaml](../../buildtemplate.yaml) for the ```OW_RUNTIME_PLATFORM``` parameter, you will need to invoke different endpoints to execute the test.

### Running with OW_RUNTIME_PLATFORM set to "knative"

#### Invoke / endpoint on the Service

```
curl -H "Host: java-helloworld-with-params.default.example.com" -d '{"value": {"name": "Joe", "place": "TX"}}' -H "Content-Type: application/json" http://localhost/
```

#### Initialize the runtime

You have an option to initialize the runtime with the function and other configuration data if its not initialized (i.e. built using [build-without-code.yaml.tmpl](build-without-code.yaml.tmpl))

```
curl -H "Host: java-helloworld-with-params.default.example.com" -d "@knative-data-init.json" -H "Content-Type: application/json" http://localhost/

{"OK":true}
```

#### Run the function

Execute the function.

```
curl -H "Host: java-helloworld-with-params.default.example.com" -d "@knative-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/

{"payload":"Hello Jill from OK!"};
```

### Running with OW_RUNTIME_PLATFORM set to "openwhisk"

#### Initialize the runtime

Initialize the runtime with the function and other configuration data using the ```/init``` endpoint.

```
curl -H "Host: java-helloworld-with-params.default.example.com" -d "@openwhisk-data-init.json" -H "Content-Type: application/json" http://localhost/init

{"OK":true}
```

#### Run the function

Execute the function using the ```/run``` endpoint.

```
curl -H "Host: java-helloworld-with-params.default.example.com" -d "@openwhisk-data-run.json" -H "Content-Type: application/json" -X POST http://localhost/run

{"payload":"Hello Joe from TX!"};
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
UEsDBBQACAgIABljwUoAAAAAAAAAAAAAAAAJAAQATUVUQS1JTkYv/soAAAMAUEsHCAAAAAACAAAAAAAAAFBLAwQUAAgICAAZY8FKAAAAAAAAAAAAAAAAFAAAAE1FVEEtSU5GL01BTklGRVNULk1G803My0xLLS7RDUstKs7Mz7NSMNQz4OVyLkpNLElN0XWqBAlY6BnEmxkoaPgXJSbnpCo45xcV5BcllgCVa/Jy8XIBAFBLBwhiwEEKQwAAAEQAAABQSwMEFAAICAgACmPBSgAAAAAAAAAAAAAAAAsAAABIZWxsby5jbGFzc31T227TQBA9k5tdx6HBtCkUUhpuTdK0Bkq5NFUlioQQSqFSUCV428Qr4+JL5DgVfAp/AS+pRCU+gG9CiFmLgFTSWvLM7J6Zc2Zn7R+/vn0H8ABtAxaqOpZ0XDegYVmZmoEbuKnhlloweFvDHQOGCleUr+toKN9U+KqGloY1QmHbC71kh5CtNw4IuWeRIwmzHS+Ur0ZBT8ZvRM/nnVwgvJCwVe/0o8B2o8j1pe0Oo9B+yeZ171D2k3bjPJBQ6iai/2FPDFJODesEoxuN4r587ikN44X0/Wj9UBwJE5cwR9CHSSxCV8bcQCgCacLGXRP3cF/DhsmT2CQsnq3JBG4sZeKFLmFB8do+09ndJOat3ZHnO4q6kOoum3iIRwSqmXiMTRNPsEXIpxih/K96wl0+TchDfC+GhPl65zTUbrwjWK5Mng5Ve/uxF3iJd8SH3piWPHWOf4t4lNVzEwjFVGrS1ly98b8In1sMBjJ0CGtTezhjXlyoJ9GEuigcZz+OBjJOPhFWphBNoT5ADRf5E1ZPBqTumu08r6rsiX2+eQz6ygGhwraQbmYwgwVc/pP6ETlk2e9YmU7Tyo6R+4xSGuTHKHROoL09hr7XsmZOYHBYtMwxSqv8WhfYjDE7Rrn1JeVVGousgpQzD5PjCv8mS9CxzapXGNFBP1HROI9wNa269htQSwcIevrqgf8BAACRAwAAUEsBAhQAFAAICAgAGWPBSgAAAAACAAAAAAAAAAkABAAAAAAAAAAAAAAAAAAAAE1FVEEtSU5GL/7KAABQSwECFAAUAAgICAAZY8FKYsBBCkMAAABEAAAAFAAAAAAAAAAAAAAAAAA9AAAATUVUQS1JTkYvTUFOSUZFU1QuTUZQSwECFAAUAAgICAAKY8FKevrqgf8BAACRAwAACwAAAAAAAAAAAAAAAADCAAAASGVsbG8uY2xhc3NQSwUGAAAAAAMAAwC2AAAA+gIAAAAA"
```

### Update value for "code" key in test file

Any file that contains an "init" payload will need to be updated. For example, using ```payload-knative-init-run.http``` as an example:

```
POST http://localhost:8080/ HTTP/1.1
content-type: application/json

{
  "init": {
    "name" : "java-helloworld-with-params",
    "main" : "Hello",
    "binary": true,
    "code" : "UEsDBBQACAgIACZ+p04AAAAAAAAAAAAAAAAJAAQATUVUQS1JTkYv/soAAAMAUEsHCAAAAAACAAAAAAAAAFBLAwQUAAgICAAmfqdOAAAAAAAAAAAAAAAAFAAAAE1FVEEtSU5GL01BTklGRVNULk1G803My0xLLS7RDUstKs7Mz7NSMNQz4OVyLkpNLElN0XWqBAlY6BnEGxkYKWi4JudkFhSnKvgXpOZ5WWrycvFyAQBQSwcIMFMkp0EAAABBAAAAUEsDBBQACAgIAAl+p04AAAAAAAAAAAAAAAAKAAAASGVsbG8uamF2YX1TTW+bQBC98yumnHDi4qrHRjnQJFZoIxwFp1GOaxhgW9ilu0uIVeW/d4aPBKlRORjv7Myb994MmxMPTuBGZqgs5uA0uAohakVGr1QXrhcGYas7lQsntYIgSrcroCMa0ApBG2i0QUbJtHJGHjpHsXpEBFEaxAaVsyFAijjAJ7t9fHEFhawRcmnHIureS1cxkKukhV6bX1AQlMhzya1FDVJRoBmJGCyFyaUqqW97NLKsHOheobGVbEOG2bOSdDtzsSPu0JV0PupukrFQPBmxhh+Ew10+h58YKuAcf7r1V2dwpOpGHEFpB53FBTQ+Z9g6okq8mraWQmW4UPbag/x4nED0wQnKF4MS0MUyDYSjQq7lp3Ku/bLZ9H0fioFxqE25mQVubsjWJL36OLLmontVo7Vk1u9OGrL4cATREqtMHIhrLXoe4DCkYfjEojfktirXYKfpM8xySm+mzRRJ+jKBbBMK/CiFOPXha5TG6ZpBHuL99e5+Dw/R3V2U7OOrFHZ3cLFLLuN9vEvotIUoeYTvcXK5BiTLqA8+t4YVEE3JdmI+zHZepZkCLwqfbYuZLGRG0lTZiRKh1E9oFO9Ji6aRlsdqiWDOMLVspBv2yf6rixttPI/aauN4mmGpdVljWFqtwm/0szv8xMydeW13IEshqwUxvca61vDHA5jCljtk8FZAQ5cqWJyFKe1qKKGPhHwksko0COfgk62kBI1/NtzKAgLODithA5+T/NVquIG5ZLgu0UWWO9waliifcM4er8Yuweo91LYW2QJ2OP4Pd8p/D3ihkabYah7VOSjsFzdz7pwQ0gd/azRNyx0Dn1eT99Ffgz8668PpKPWU/hZGN0NkZEmhD/4rnuuMeoXl4Iv34v0FUEsHCLo+QyCQAgAA8gQAAFBLAQIUABQACAgIACZ+p04AAAAAAgAAAAAAAAAJAAQAAAAAAAAAAAAAAAAAAABNRVRBLUlORi/+ygAAUEsBAhQAFAAICAgAJn6nTjBTJKdBAAAAQQAAABQAAAAAAAAAAAAAAAAAPQAAAE1FVEEtSU5GL01BTklGRVNULk1GUEsBAhQAFAAICAgACX6nTro+QyCQAgAA8gQAAAoAAAAAAAAAAAAAAAAAwAAAAEhlbGxvLmphdmFQSwUGAAAAAAMAAwC1AAAAiAMAAAAA"
  },
  "activation": {
    "namespace": "default",
    "action_name": "java-helloworld-with-params",
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
