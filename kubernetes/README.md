# Deploying OpenWhisk on Kubernetes

[![Build Status](https://travis-ci.org/openwhisk/openwhisk-devtools.svg?branch=master)](https://travis-ci.org/openwhisk/openwhisk-devtools)

The collection of scripts and Kubernets pods can be used to
run OpenWhisk in a Kubernets cluster.

#### Kubernetes Requirments

* Kubernetes needs to be version 1.5+
* Kubernetes pods can receive public addresses
* Kubernetes has DNS deployed


## Configure OpenWhisk on Kube

Prep the Kube environment by setting up the OpenWhisk namespaces `openwhisk`

```
kubectl apply -f configure/openwhisk_kube_namespace.yml
```

From here, you should just need to run the Kubernetes job to
setup the environemnt.

```
kubectl apply -f configure/configure_whisk.yml
```


## Kube Docker Files
#### OpenWhisk Deployment File

The docker image resposnible for deploying OpenWhisk can be built using following command:

```
docker build .
```

This image must then be re-taged and pushd to a public
docker repo. Currently, while this project is in development,
the docker image is built and published [here](https://hub.docker.com/r/danlavine/whisk_config/),
until an official repo is set up. If you would like to change
this image to one you created, then make sure to update the
[configure_whisk.yml](./configure/configure_whisk.yml) with your image.

#### Whisk Docker Files

for Kubernets, all of the whisk images need to be public
Docker files. For this, there is a helper script that will
run `gradle build` for the main openwhisk repo and retag all of the
images for a custom docker hub user.

This script has 2 arguments:
1. The name of the dockerhub repo where the images will be published.
   For example:

   ```
   docker/build.sh danlavine
   ```

   will retage the `whisk/invoker` docker image built by gradle and
   publish it to `danlavine/whisk_invoker`.

2. (OPTIONAL) This argument is the location of the OpenWhisk repo.
   By default this repo is assumed to live at `$HOME/workspace/openwhisk`

## Development
#### Creating a new deployment

When in the process of creating a new deployment, it is nice to
run things by hand to see what is going on inside the container and
not have it be removed as soon as it finishes or fails. For this,
you can change the command of [configure_whisk.yml](./configure/configure_whisk.yml)
to `command: [ "tail", "-f", "/dev/null" ]`. Then just run the
original command from inside the Pod's container.

#### Cleanup

As part of the developmet process, you might need to cleanup the Kubernetes
enviroment at some point. For this, we want to delete all the Kube deployments,
services and jobs. For this, you can run the following script:

```
./kube_environment/cleanup.sh
```
