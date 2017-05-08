#!/bin/bash

set -ex

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../"

cd $ROOTDIR

# TODO: need official repo
# build openwhisk images
# This way everything that is teset will use the lates openwhisk builds

# run scripts to deploy using the new images.
kubectl apply -f configure/openwhisk_kube_namespace.yml
kubectl apply -f configure/configure_whisk.yml

sleep 5

CONFIGURE_POD=$(kubectl get pods --all-namespaces -o wide | grep configure | awk '{print $2}')

PASSED=false
TIMEOUT=0
until $PASSED || [ $TIMEOUT -eq 20 ]; do
  KUBE_DEPLOY_STATUS=$(kubectl -n openwhisk get jobs | grep configure-openwhisk | awk '{print $3}')
  if [ $KUBE_DEPLOY_STATUS -eq 1 ]; then
    PASSED=true
    break
  fi

  kubectl get pods --all-namespaces -o wide --show-all

  let TIMEOUT=TIMEOUT+1
  sleep 30
done

kubectl -n openwhisk logs $CONFIGURE_POD
kubectl get jobs --all-namespaces -o wide --show-all
kubectl get pods --all-namespaces -o wide --show-all

if [ "$PASSED" = false ]; then
  echo "The job to configure OpenWhisk did not finish with an exit code of 1"
  exit 1
fi

echo "The job to configure OpenWhisk finished successfully"

# push the images to an official repo
