#!/usr/bin/env bash

# this script is used to cleanup the OpenWhisk deployment

set -x

# delete OpenWhisk configure job
kubectl -n openwhisk delete job configure-openwhisk

# delete deployments
kubectl -n openwhisk delete deployment couchdb

# delete services
kubectl -n openwhisk delete service couchdb
