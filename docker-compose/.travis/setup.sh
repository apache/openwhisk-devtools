# This script assumes Docker is already installed
# see tools/travis/setup.sh
#!/bin/bash

set -x
set -e

uname -s
uname -m
docker-compose --version

version_exists=`(docker-compose --version | grep ${DOCKER_COMPOSE_VERSION}) || echo "false"`
if [ "${version_exists}" == "false" ]
then
    echo "Installing Docker Compose ${DOCKER_COMPOSE_VERSION}"
    sudo rm /usr/local/bin/docker-compose
    curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > docker-compose.bin
    chmod +x docker-compose.bin
    sudo mv docker-compose.bin /usr/local/bin/docker-compose
fi
echo "Docker Compose Version:" `docker-compose --version`
