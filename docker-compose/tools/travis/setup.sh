#!/bin/bash
set -x
set -e

DOCKER-COMPOSE='docker-compose'
DOCKER-COMPOSE-TMP='$DOCKER-COMPOSE.tmp'

# This script assumes Docker is already installed
# see tools/travis/setup.sh
version_exists=`(docker-compose --version | grep ${DOCKER_COMPOSE_VERSION}) || echo "false"`
echo "version exists:" version_exists

if [ "${version_exists}" == "false" ]
then
    echo "Installing Docker Compose ${DOCKER_COMPOSE_VERSION}"
    if [ -f $DOCKER-COMPOSE ]; then
        sudo rm /usr/local/bin/$DOCKER-COMPOSE
    fi
    curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > $DOCKER-COMPOSE-TMP
    chmod +x $DOCKER-COMPOSE-TMP
    sudo mv $DOCKER-COMPOSE-TMP /usr/local/bin/$DOCKER-COMPOSE
fi
echo "Docker Compose Version:" `docker-compose --version`
