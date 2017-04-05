#!/usr/bin/env bash

# This script can be used to build the custom docker images required
# for Kubernetes. This involves running the entire OpenWhisk gradle
# build process and then creating the custom images for OpenWhisk.

# prerequisites:
#   * be able to run `cd <home_openwhisk> ./gradlew distDocker`

set -ex


if [ -z "$1" ]; then
cat <<- EndOfMessage
  First argument should be location of which docker repo to push all
  of the built OpenWhisk docker images. This way, Kubernetes can pull
  any images it needs to.
EndOfMessage

exit 1
fi

OPENWHISK_DIR=""
if [ -z "$2" ]; then
cat <<- EndOfMessage
  Second argument should be the location of where the OpenWhisk repo lives.
  By default the location is $HOME/workspace/openwhisk
EndOfMessage

  OPENWHISK_DIR=$HOME/workspace/openwhisk
else
  OPENWHISK_DIR="$2"
fi

pushd $OPENWHISK_DIR
  ./gradlew distDocker
popd

## Retag new images for public repo
docker tag whisk/badaction "$1"/whisk_badaction
docker tag whisk/badproxy "$1"/whisk_badproxy
docker tag whisk/cli "$1"/whisk_cli
docker tag whisk/example "$1"/whisk_example
docker tag whisk/swift3action "$1"/whisk_swift3action
docker tag whisk/pythonaction "$1"/whisk_pythonaction
docker tag whisk/nodejs6action "$1"/whisk_nodejs6action
docker tag whisk/nodejsactionbase "$1"/whisk_nodejsactionbase
docker tag whisk/javaaction "$1"/whisk_javaaction
docker tag whisk/invoker "$1"/whisk_invoker
docker tag whisk/controller "$1"/whisk_controller
docker tag whisk/dockerskeleton "$1"/whisk_dockerskeleton
docker tag whisk/scala "$1"/whisk_scala

docker push "$1"/whisk_badaction
docker push "$1"/whisk_badproxy
docker push "$1"/whisk_cli
docker push "$1"/whisk_example
docker push "$1"/whisk_swift3action
docker push "$1"/whisk_pythonaction
docker push "$1"/whisk_nodejs6action
docker push "$1"/whisk_nodejsactionbase
docker push "$1"/whisk_javaaction
docker push "$1"/whisk_invoker
docker push "$1"/whisk_controller
docker push "$1"/whisk_dockerskeleton
docker push "$1"/whisk_scala
