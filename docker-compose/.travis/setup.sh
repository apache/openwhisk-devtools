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

set -x -e
uname -sm

DOCKER_COMPOSE="docker-compose"
DOCKER_COMPOSE_TMP="$DOCKER_COMPOSE.bin"

version_exists=`(docker-compose --version | grep ${DOCKER_COMPOSE_VERSION}) || echo "false"`

# This script assumes Docker is already installed
# Trusty for Travis SHOULD include latest docker compose (e.g., 1.13.0)
if [ "${version_exists}" == "false" ]
then
    echo "Installing Docker Compose ${DOCKER_COMPOSE_VERSION}"
    if [ -f /usr/local/bin/$DOCKER_COMPOSE ]; then
        sudo rm /usr/local/bin/$DOCKER_COMPOSE
    fi
    curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > $DOCKER_COMPOSE_TMP
    chmod +x $DOCKER_COMPOSE_TMP
    sudo mv $DOCKER_COMPOSE_TMP /usr/local/bin/$DOCKER_COMPOSE
fi
echo "Docker Compose Version:" `docker-compose --version`
