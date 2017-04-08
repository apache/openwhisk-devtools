#!/usr/bin/env bash

# This script can be used to build the custom docker images required
# for deploying openwhisk on Kubernetes.

set -ex

if [ -z "$1" ]; then
cat <<- EndOfMessage
  First argument should be location of which docker repo to push all
  of the built OpenWhisk docker images. This way, Kubernetes can pull
  any images it needs to.
EndOfMessage

exit 1
fi

SOURCE="${BASH_SOURCE[0]}"
SCRIPTDIR="$( dirname "$SOURCE" )"

pushd $SCRIPTDIR/invoker
 KUBE_INVOKER_IMAGE=$(docker build . | grep "Successfully built" | awk '{print $3}')
 docker tag $KUBE_INVOKER_IMAGE "$1"/whisk_kube_invoker
 docker push "$1"/whisk_kube_invoker
popd
