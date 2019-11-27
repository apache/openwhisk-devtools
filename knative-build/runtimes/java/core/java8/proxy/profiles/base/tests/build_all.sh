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
        echo "Compiling Test: ${f}"
        cd $f
        ls -al *.jar
        echo "Compiling Class..."
        javac -verbose -classpath ../../libs/gson-2.8.5.jar Hello.java
        echo "Creating JAR..."
        jar cvf hello.jar *.class
        echo "Base64 encoding JAR..."
        unameOut="$(uname -s)"
        case "${unameOut}" in
            Linux*)   B64_WRAP="-w0";;
            Darwin*)  B64_WRAP="";;
        esac
        #base64 -w0 hello.jar > hello.jar.base64
        base64 $B64_WRAP hello.jar > hello.jar.base64
        cd ..
    fi
done
