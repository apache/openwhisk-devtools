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

abs_path()
{
    pushd $(dirname "$1") > /dev/null
    echo $(pwd)/$(basename "$1")
    popd > /dev/null

}

this_dir=$(dirname "$(abs_path "$0")")
action_executor="$this_dir/test.js"
action_image="openwhisk/nodejs6action:latest"
debug_env="debug_disabled"


while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    --action)
    action="$(abs_path "$2")"
    shift # past argument
    ;;
    --param)
    params+=" $2"
    shift # past argument
    ;;
    --image)
    action_image="$2"
    shift # past argument
    ;;
    --debug)
    debug_env="NODE_DEBUG=request"
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
done

echo "#######################################################"
echo "Testing action $action using image $action_image"
echo "#######################################################"



docker_cmd="docker run --name=\"actiontest\" --rm -it \
    -e \"$debug_env\" \
    -v \"$action_executor:/nodejsAction/testexecutor.js\" \
    -v \"$action:/nodejsAction/testaction.js\" \
    $action_image node testexecutor.js ./testaction.js $params"

#using eval here because $params may have multiple space separate values, which need to be passed as separate args
eval "$docker_cmd"
