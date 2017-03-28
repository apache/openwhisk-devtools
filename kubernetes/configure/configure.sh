#!/usr/bin/env bash

# this script is used to deploy OpenWhisk from a pod already running in
# kubernetes.
#
# Note: This pod assumes that there is an openwhisk namespace and the pod
# running this script has been created in that namespace.

set -ex

# copy the ansible playbooks and tools to this repo
cp -R /openwhisk/ansible/ /openwhisk-devtools/kubernetes/ansible
cp -R /openwhisk/tools/ /openwhisk-devtools/kubernetes/tools

# overwrite the default openwhisk ansible with the kube ones.
cp -R /openwhisk-devtools/kubernetes/ansible-kube/. /openwhisk-devtools/kubernetes/ansible/

# start kubectl in proxy mode so we can talk to the Kube Api server
kubectl proxy -p 8001 &

pushd /openwhisk-devtools/kubernetes/ansible
  # Create all of the necessary services
  kubectl apply -f environments/kube/files/db-service.yml
  kubectl apply -f environments/kube/files/consul-service.yml

  # Create the CouchDB deployment
  ansible-playbook -i environments/kube couchdb.yml
  # configure couch db
  ansible-playbook -i environments/kube initdb.yml
  ansible-playbook -i environments/kube wipe.yml

  # Run through the openwhisk deployment
  ansible-playbook -i environments/kube openwhisk.yml
popd
