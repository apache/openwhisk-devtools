#!/bin/bash

set -ex

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../"

cd $ROOTDIR

# build openwhisk images
# This way everything that is teset will use the lates openwhisk builds
# TODO: need official repo

# run scripts to deploy using the new images.
kubectl apply -f configure/openwhisk_kube_namespace.yml
kubectl apply -f configure/configure_whisk.yml

PASSED=false
TIMEOUT=0
until $PASSED || [ $TIMEOUT -eq 10 ]; do
  KUBE_DEPLOY_STATUS=$(kubectl -n openwhisk get jobs | grep configure-openwhisk | awk '{print $3}')
  if [ $KUBE_DEPLOY_STATUS -eq 1 ]; then
    PASSED=true
    break
  fi

  let TIMEOUT=TIMEOUT+1
  sleep 30
done

kubectl get jobs --all-namespaces -o wide --show-all
kubectl get pods --all-namespaces -o wide --show-all

if [ "$PASSED" = false ]; then
  echo "The job to configure OpenWhisk did not finish with an exit code of 1"
  exit 1
fi

echo "The job to configure OpenWhisk finished successfully"

# push the images to an official repo
