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

# Java 8 OpenWhisk Runtime Container


## 1.1.2
Changes:
-  Update run handler to accept more environment variables [#67](https://github.com/apache/incubator-openwhisk-runtime-java/pull/67)

## 1.1.1
Changes:
- Adds log markers.
- Improve error handling for improper initialization.

## 1.1.0
Changes:
- Replaced oracle [jdk8u131-b11](http://download.oracle.com/otn-pub/java/jdk/"${VERSION}"u"${UPDATE}"-b"${BUILD}"/d54c1d3a095b4ff2b6607d096fa80163/server-jre-"${VERSION}"u"${UPDATE}"-linux-x64.tar.gz) with OpenJDK [adoptopenjdk/openjdk8-openj9:jdk8u162-b12_openj9-0.8.0](https://hub.docker.com/r/adoptopenjdk/openjdk8-openj9)

## 1.0.1
Changes:
- Allow custom name for main Class

## 1.0.0
Changes:
- Initial release
