#!/bin/bash
set -x
set -e

DOCKER_COMPOSE="docker-compose"
DOCKER_COMPOSE_TMP="$DOCKER_COMPOSE.tmp"

# This script assumes Docker is already installed
# see tools/travis/setup.sh
version_exists=`(docker-compose --version | grep ${DOCKER_COMPOSE_VERSION}) || echo "false"`
echo "version exists:" version_exists

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
