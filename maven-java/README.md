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

# Maven Example


This example shows how to deploy a Java Action which has external dependency.  This
example uses Maven as the dependency manager.

## Build

```
./mvnw clean install
```

## Deploying the application to OpenWhisk

```
wsk -i action create md5hasher target/maven-java.jar --main org.apache.openwhisk.example.maven.App
```

## Invoking Action

```
wsk -i action invoke md5hasher --result -p text openwhisk
```

Invoking the above action will return an JSON output which will have original plain text and MD5 hash of the same.

#### Output of above action:

```
{
    "md5": "803cd3a8fe96ceab1dc654dc6e41be5c",
    "text": "openwhisk"
}
```
