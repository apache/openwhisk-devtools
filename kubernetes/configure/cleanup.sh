#!/usr/bin/env bash

# this script is used to cleanup the OpenWhisk deployment

set -x

# delete OpenWhisk configure job
kubectl -n openwhisk delete job configure-openwhisk

# delete deployments
kubectl -n openwhisk delete deployment couchdb
kubectl -n openwhisk delete deployment consul
kubectl -n openwhisk delete deployment kafka

# delete configmaps
kubectl -n openwhisk delete cm consul

# delete services
kubectl -n openwhisk delete service couchdb
kubectl -n openwhisk delete service consul
kubectl -n openwhisk delete service kafka
