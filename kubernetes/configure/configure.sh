#!/usr/bin/env bash

# this script is used to deploy OpenWhisk from a pod already running in
# kubernetes.
#
# Note: This pod assumes that there is an openwhisk namespace and the pod
# running this script has been created in that namespace.

set -ex

kubectl proxy -p 8001 &

# Create all of the necessary services
pushd /openwhisk-devtools/kubernetes/ansible
  kubectl apply -f environments/kube/files/db-service.yml
popd

# Create the CouchDB deployment
pushd /openwhisk-devtools/kubernetes/ansible
  cp /openwhisk/ansible/group_vars/all group_vars/all
  ansible-playbook -i environments/kube couchdb.yml
popd

## configure couch db
pushd /openwhisk/ansible/
  ansible-playbook -i /openwhisk-devtools/kubernetes/ansible/environments/kube initdb.yml
  ansible-playbook -i /openwhisk-devtools/kubernetes/ansible/environments/kube wipe.yml
popd

