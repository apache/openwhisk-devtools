# Deploying OpenWhisk on Kubernetes (work in progress)

[![Build Status](https://travis-ci.org/openwhisk/openwhisk-devtools.svg?branch=master)](https://travis-ci.org/openwhisk/openwhisk-devtools)

This repo can be used to deploy OpenWhisk to a Kubernetes cluster.
To accomplish this, we have created a Kubernetes job responsible for
deploying OpenWhisk from inside of Kubernetes. This job runs through
the OpenWhisk Ansible playbooks with some modifications to "Kube-ify"
specific actions. The reason for this approach is to try and streamline
a one size fits all way of deploying OpenWhisk.

Currently, the OpenWhisk deployment is going to be a static set of
Kube yaml files. It should be easy to use the tools from this
repo to build your own OpenWhisk deployment job, allowing you to
set up your own configurations if need be.

The scripts and Docker images should be able to:

1. Build the Docker image used for deploying OpenWhisk.
2. Uses a Kubernetes job to deploy OpenWhisk.

Currently, not all of the OpenWhisk components are deployed.
So far, it will create Kube Deployments for:

* couchdb
* consul
* controller
* invoker

To track the process, check out this [issue](https://github.com/openwhisk/openwhisk-devtools/issues/14).

## Kubernetes Requirements

* Kubernetes needs to be version 1.5+
* Kubernetes has [Kube-DNS](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) deployed
* (Optional) Kubernetes Pods can receive public addresses.
  This will be required if you wish to reach Nginx from outside
  of the Kubernetes cluster's network.

At this time, we are not sure as to the total number of resources required
to deploy OpenWhisk On Kubernetes. Once all of the process are running in
Pods we will be able to list those.

## Quick Start

To deploy OpenWhisk on Kubernetes, you will need to target a Kubernetes
environment. If you do not have one up and running, then you can look
at the [Local Kube Development](#local-kube-development) section
for setting one up. Once you are successfully targeted, you will need to create a
create a namespace called `openwhisk`. To do this, you can just run the
following command.

```
kubectl apply -f configure/openwhisk_kube_namespace.yml
```

From here, you should just need to run the Kubernetes job to
setup the OpenWhisk environment.

```
kubectl apply -f configure/configure_whisk.yml
```


## Manually Building Custom Docker Files
#### Building the Docker File That Deploys OpenWhisk

The Docker image responsible for deploying OpenWhisk can be built using following command:

```
docker build .
```

This image must then be re-tagged and pushed to a public
docker repo. Currently, while this project is in development,
the docker image is built and published [here](https://hub.docker.com/r/danlavine/whisk_config/),
until an official repo is set up. If you would like to change
this image to one you created, then make sure to update the
[configure_whisk.yml](./configure/configure_whisk.yml) with your image.

## Manually building Kube Files
#### Deployments and Services

The current Kube Deployment and Services files that define the OpenWhisk
cluster can be found [here](ansible/environments/kube/files). Only one
instance of each OpenWhisk process is created, but if you would like
to increase that number, then this would be the place to do it. Simply edit
the appropriate file and rebuild the
[Docker File That Deploys OpenWhisk](#building-the-docker-file-that-deploys-openWhisk)

## Development
#### Local Kube Development

There are a couple ways to bring up Kubernetes locally and currently we
are using [kubeadm](https://kubernetes.io/docs/getting-started-guides/kubeadm/)
with [Callico](https://www.projectcalico.org/) for the
[network](http://docs.projectcalico.org/v2.1/getting-started/kubernetes/installation/hosted/kubeadm/).
By default kubeadm runs with Kube-DNS already enabled and the instructions
will install a Kube version greater the v1.5. Using this deployment method
everything is running on one host and nothing special has to be
done for network configurations when communicating with Kube Pods.

#### Deploying OpenWhisk on Kubernetes

When in the process of creating a new deployment, it is nice to
run things by hand to see what is going on inside the container and
not have it be removed as soon as it finishes or fails. For this,
you can change the command of [configure_whisk.yml](configure/configure_whisk.yml)
to `command: [ "tail", "-f", "/dev/null" ]`. Then just run the
original command from inside the Pod's container.

#### Cleanup

As part of the development process, you might need to cleanup the Kubernetes
environment at some point. For this, we want to delete all the Kube deployments,
services and jobs. For this, you can run the following script:

```
./kube_environment/cleanup.sh
```
## Troubleshooting
#### Kafka

When deploying Kubernetes on Ubuntu 14.04 with the `local_up_cluster.sh` scripts,
you might need to allow kube pods to communicate with themselves over KubeDNS.
To enable this on the Docker network, you will need to run the following command:

```
ip link set docker0 promisc on
```
