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
USAGE="cleanjs.sh <SOURCE_DIR>"

if [ $1 ]
then
    : # $1 was given
    SOURCE=$1

    echo "SOURCE=[$SOURCE]"
    TARGET=$SOURCE"/.cleanjs"
    echo "TARGET=[$TARGET]"

    # create target directory
    mkdir -p $TARGET

    # copy all javascript files while preserving the original path
    find $SOURCE -name "*.js" | cpio -p -dumv $TARGET/

    # remove the package itself
    find $TARGET -type f -exec sed -i '' -e '\|utils/debug|d' '{}' \;

    # remove all lines that dereference the package (i.e., named DEBUG by convention)
    find $TARGET -type f -exec sed -i '' -e '/DEBUG/d' '{}' \;

else
    echo $USAGE
    exit 1
fi
