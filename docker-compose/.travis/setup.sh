#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one or more contributor
# license agreements; and to You under the Apache License, Version 2.0.

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
