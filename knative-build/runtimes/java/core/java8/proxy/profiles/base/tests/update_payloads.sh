#!/bin/bash
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
set +x

for f in *; do
    # if the file is a directory
    if [ -d ${f} ]; then
        echo "Updating 'code' payload with base64 encoded archive data: ${f}"
        cd $f
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" openwhisk-data-init.json.tmpl > openwhisk-data-init.json
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" knative-data-init.json.tmpl > knative-data-init.json
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" knative-data-init-run.json.tmpl > knative-data-init-run.json
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" payload-knative-init.http.tmpl > payload-knative-init.http
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" payload-knative-init-run.http.tmpl > payload-knative-init-run.http
            sed "s#BASE64_ENCODED_JAR#$(cat hello.jar.base64)#" payload-openwhisk-init.http.tmpl > payload-openwhisk-init.http
        cd ..
    fi
done
