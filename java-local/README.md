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

# Testing Java functions locally

## Building CLI
```bash
./gradlew jar
```

## Usage

```bash
java -jar ./build/libs/java-local.jar ./path-to-function.jar parameter=value parameter2=value2 --main=myproject.Myfunction
```

Will invoke the `main` function of `myproject.Myfunction` class from `path-to-function.jar` with following `params`:
```json
{
  "parameter":"value",
  "parameter2":"value"
}
```
Alternatively, you can test a single Java file by directly invoking it. In this case the Java file should not require any third party libraries.

```bash
java -jar ./build/libs/java-local.jar ./myproject/Myfunction.java parameter=value parameter2=value2
```

This will always return a JSON formatted result that can be post-processed

It is also possible to pass input on stdin, this allows the creation of more complex input
objects that would be inconvenient to edit on the command line or passing non-string values.

```bash
echo '{"name": "value"}' | java -jar ./build/libs/java-local.jar ./path-to-function.jar --main=myproject.Myfunction
cat input.json | java -jar ./build/libs/java-local.jar ../myproject/Myfunction.java
```
