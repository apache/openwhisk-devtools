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
        echo "Cleaning up build artifacts for test: '${f}'"
        cd $f
        rm Hello.class
        rm hello.jar
        rm hello.jar.base64
        rm openwhisk-data-init.json
        rm knative-data-init.json
        rm knative-data-init-run.json
        rm payload-knative-init.http
        rm payload-knative-init-run.http
        rm payload-openwhisk-init.http
        cd ..
    fi
done
