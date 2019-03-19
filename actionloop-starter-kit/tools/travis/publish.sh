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

set -eux

# Build script for Travis-CI.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../.."
WHISKDIR="$ROOTDIR/../openwhisk"

export OPENWHISK_HOME=$WHISKDIR

IMAGE_PREFIX=$1
RUNTIME_VERSION=$2
IMAGE_TAG=$3

if [ ${RUNTIME_VERSION} == "2" ]; then
  RUNTIME="python2Action"
elif [ ${RUNTIME_VERSION} == "3" ]; then
  RUNTIME="pythonAction"
elif [ ${RUNTIME_VERSION} == "3-ai" ]; then
  RUNTIME="python3AiAction"
elif [ ${RUNTIME_VERSION} == "3-loop" ]; then
  RUNTIME="pythonActionLoop"
fi

if [[ ! -z ${DOCKER_USER} ]] && [[ ! -z ${DOCKER_PASSWORD} ]]; then
docker login -u "${DOCKER_USER}" -p "${DOCKER_PASSWORD}"
fi

if [[ ! -z ${RUNTIME} ]]; then
TERM=dumb ./gradlew \
:core:${RUNTIME}:distDocker \
-PdockerRegistry=docker.io \
-PdockerImagePrefix=${IMAGE_PREFIX} \
-PdockerImageTag=${IMAGE_TAG}

  # if doing latest also push a tag with the hash commit
  if [ ${IMAGE_TAG} == "latest" ]; then
  SHORT_COMMIT=`git rev-parse --short HEAD`
  TERM=dumb ./gradlew \
  :core:${RUNTIME}:distDocker \
  -PdockerRegistry=docker.io \
  -PdockerImagePrefix=${IMAGE_PREFIX} \
  -PdockerImageTag=${SHORT_COMMIT}
  fi

fi
