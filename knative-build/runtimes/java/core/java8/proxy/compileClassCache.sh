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

# Standard Options:
# ================
# -Dfile.encoding=UTF-8:
#    Sets the encoding Java will use to read/write files by default.
#
# JVM Options used:
#
# Non-Standard Options:
# ====================
# -Xquickstart:
#    The effect is faster compilation times that improve startup time, but longer running applications might run slower. When the AOT compiler is active (both shared classes and AOT compilation enabled), -Xquickstart causes all methods to be AOT compiled. The AOT compilation improves the startup time of subsequent runs, but might reduce performance for longer running applications. -Xquickstart can degrade performance if it is used with long-running applications that contain hot methods. The implementation of -Xquickstart is subject to change in future releases. By default, -Xquickstart is disabled..
#    Another way to specify a behavior identical to -Xquickstart is to use the -client option. These two options can be used interchangeably on the command line.
# --Xshareclasses:<suboptions>:
#    Enables class sharing. This option can take a number of suboptions, some of which are cache utilities.
#    - cacheDir=<directory>: Sets the directory in which cache data is read and written.
#### Construct Class Cache with HTTP Server classes by starting the server ####

JAVA_STANDARD_OPTIONS="-Dfile.encoding=UTF-8"
# #### Construct Class Cache with HTTP Server classes by starting the server ####
JAVA_EXTENDED_OPTIONS="-Xshareclasses:cacheDir=/javaSharedCache/ -Xquickstart"
JAVA_VERBOSE_OPTIONS="-verbose:class -verbose:sizes"
#JAVA_VERBOSE_OPTIONS=""
JAVA_JVM_KILL_DELAY=5s

export OW_ALLOW_MULTIPLE_INIT=true

echo "Creating shared class cache with Proxy and 'base' profile libraries..."
java $JAVA_VERBOSE_OPTIONS $JAVA_STANDARD_OPTIONS $JAVA_EXTENDED_OPTIONS "-jar" "/javaAction/build/libs/javaAction-all.jar" &
HTTP_PID=$!

echo "Building pre-cache functions and executing..."
./buildProfileClasses.sh

echo "Sleeping (${JAVA_JVM_KILL_DELAY}) allowing cache to be populated before killing JVM process (${HTTP_PID})..."
sleep $JAVA_JVM_KILL_DELAY
echo "Killing JVM process (${HTTP_PID})..."
kill $HTTP_PID

unset OW_ALLOW_MULTIPLE_INIT
