<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# App Deployment with Knative 0.2.2 on Docker for Desktop

This guide walks us over the set of instructions we followed to get sample applications deployed on Knative.

## Deploy helloworld-go App

Before you begin, please verify:

- [x] Docker Desktop Community Version 2.0.0.2(30215)
- [x] Docker Desktop for Mac is set to **4 CPU**
- [x] Docker Desktop for Mac is set to at least **8 GB Memory**
- [x] Kubernetes Cluster is enabled and running. By default, Docker Desktop for Mac installs Kubernetes `v1.10.11`
- [x] Kubectl is installed using `brew install kubectl`

### Verify Kubernetes Installation:

```bash
$ kubectl version
Client Version: version.Info{Major:"1", Minor:"9", GitVersion:"v1.9.0", GitCommit:"925c127ec6b946659ad0fd596fa959be43f0cc05", GitTreeState:"clean", BuildDate:"2017-12-15T21:07:38Z", GoVersion:"go1.9.2", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"10", GitVersion:"v1.10.11", GitCommit:"637c7e288581ee40ab4ca210618a89a555b6e7e9", GitTreeState:"clean", BuildDate:"2018-11-26T14:25:46Z", GoVersion:"go1.9.3", Compiler:"gc", Platform:"linux/amd64"}

$ kubectl get nodes
NAME                 STATUS    ROLES     AGE       VERSION
docker-for-desktop   Ready     master    9m        v1.10.11

$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                         READY     STATUS    RESTARTS   AGE
docker        compose-74649b4db6-44fz2                     1/1       Running   0          6m
docker        compose-api-65975979ff-p4tqb                 1/1       Running   0          6m
kube-system   etcd-docker-for-desktop                      1/1       Running   0          7m
kube-system   kube-apiserver-docker-for-desktop            1/1       Running   0          6m
kube-system   kube-controller-manager-docker-for-desktop   1/1       Running   0          7m
kube-system   kube-dns-86f4d74b45-fg9mz                    3/3       Running   0          8m
kube-system   kube-proxy-j66t6                             1/1       Running   0          8m
kube-system   kube-scheduler-docker-for-desktop            1/1       Running   0          7m
```

### Install Istio:

```bash
$ curl -L https://github.com/knative/serving/releases/download/v0.2.2/istio.yaml | sed 's/LoadBalancer/NodePort/' | kubectl apply --filename -
 % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   601    0   601    0     0   1747      0 --:--:-- --:--:-- --:--:--  1752
  0     0    0     0    0     0      0      0 --:--:--  0:00:01 --:--:--     0namespace "istio-system" created
configmap "istio-galley-configuration" created
configmap "istio-statsd-prom-bridge" created
configmap "istio-security-custom-resources" created
100  106k  100  106k    0     0  44524      0  0:00:02  0:00:02 --:--:-- 68984
configmap "istio" created
configmap "istio-sidecar-injector" created
serviceaccount "istio-galley-service-account" created
serviceaccount "istio-egressgateway-service-account" created
serviceaccount "istio-ingressgateway-service-account" created
serviceaccount "istio-mixer-service-account" created
serviceaccount "istio-pilot-service-account" created
serviceaccount "istio-cleanup-secrets-service-account" created
clusterrole "istio-cleanup-secrets-istio-system" created
clusterrolebinding "istio-cleanup-secrets-istio-system" created
job "istio-cleanup-secrets" created
...
kubernetesenv "handler" created
rule "kubeattrgenrulerule" created
rule "tcpkubeattrgenrulerule" created
kubernetes "attributes" created
destinationrule "istio-policy" created
destinationrule "istio-telemetry" created
```

Verify that the pods under `istio-system` are all **Running**.

```bash
$ kubectl get pods --namespace istio-system
NAME                                        READY     STATUS    RESTARTS   AGE
istio-citadel-84fb7985bf-249lh              1/1       Running   0          4m
istio-egressgateway-bd9fb967d-cmlht         1/1       Running   0          4m
istio-galley-655c4f9ccd-r8gvw               1/1       Running   0          4m
istio-ingressgateway-688865c5f7-gqdhv       1/1       Running   0          4m
istio-pilot-6cd69dc444-md6xc                2/2       Running   0          4m
istio-policy-6b9f4697d-lzv4f                2/2       Running   0          4m
istio-sidecar-injector-8975849b4-qr77x      1/1       Running   0          4m
istio-statsd-prom-bridge-7f44bb5ddb-hs47f   1/1       Running   0          4m
istio-telemetry-6b5579595f-nqn4q            2/2       Running   0          4m
```

Now, check the `default` namespace for labels:

```bash
$ kubectl get namespace default -o yaml
apiVersion: v1
kind: Namespace
metadata:
  creationTimestamp: 2019-01-17T23:32:06Z
  name: default
  resourceVersion: "4"
  selfLink: /api/v1/namespaces/default
  uid: 19f44753-1ab0-11e9-a8d0-025000000001
spec:
  finalizers:
  - kubernetes
status:
  phase: Active
```

Notice the `default` namespace has no labels under `metadata`. Now, add the label `istio-injection=enabled`:

```bash
$ kubectl label namespace default istio-injection=enabled
namespace "default" labeled
```

Read the `default` namespace metadata again and it should have the label we just added.

```bash
kubectl get namespace default -o yaml
apiVersion: v1
kind: Namespace
metadata:
  creationTimestamp: 2019-01-17T23:32:06Z
  labels:
    istio-injection: enabled
  name: default
  resourceVersion: "1813"
  selfLink: /api/v1/namespaces/default
  uid: 19f44753-1ab0-11e9-a8d0-025000000001
spec:
  finalizers:
  - kubernetes
status:
  phase: Active
```

### Install Knative Serving:

```bash
$ curl -L https://github.com/knative/serving/releases/download/v0.2.2/release-lite.yaml | sed 's/LoadBalancer/NodePort/' | kubectl apply --filename -
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   608    0   608    0     0   1489      0 --:--:-- --:--:-- --:--:--  1493
  0  505k    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0namespace "knative-build" created
clusterrole "knative-build-admin" created
serviceaccount "build-controller" created
clusterrolebinding "build-controller-admin" created
customresourcedefinition "builds.build.knative.dev" created
customresourcedefinition "buildtemplates.build.knative.dev" created
customresourcedefinition "clusterbuildtemplates.build.knative.dev" created
customresourcedefinition "images.caching.internal.knative.dev" created
service "build-controller" created
service "build-webhook" created
image "creds-init" created
image "git-init" created
...
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
rolebinding "prometheus-system" created
clusterrolebinding "prometheus-system" created
service "prometheus-system-np" created
statefulset "prometheus-system" created
```

Make sure all the pods under `knative-serving` namespace are **Running**:

```bash
$ kubectl get pods --namespace knative-serving
NAME                          READY     STATUS    RESTARTS   AGE
activator-df78cb6f9-dxktc     2/2       Running   0          48s
activator-df78cb6f9-fdhmd     2/2       Running   0          48s
activator-df78cb6f9-zhdnn     2/2       Running   0          48s
autoscaler-6fccb66768-ksjrk   2/2       Running   0          48s
controller-56cf5965f5-x8hvk   1/1       Running   0          47s
webhook-5dcbf967cd-nltpl      1/1       Running   0          47s
```

### Deploying helloworld-go App

**Before starting to deploy any app, make sure there are no pods running in the `default` namespace where we will be deploying and creating pods for `helloworld-go` application.**

```bash
$ kubectl get pods
No resources found.
```

You can delete all the pods in a single namespace use this command:

```bash
$ kubectl delete --all pods --namespace=default
```

Now, create a new file `helloworld-go.yaml` with:

```yaml
apiVersion: serving.knative.dev/v1alpha1 # Current version of Knative
kind: Service
metadata:
  name: helloworld-go # The name of the app
  namespace: default # The namespace the app will use
spec:
  runLatest:
    configuration:
      revisionTemplate:
        spec:
          container:
            image: gcr.io/knative-samples/helloworld-go # The URL to the image of the app
            env:
              - name: TARGET # The environment variable printed out by the sample app
                value: "Go Sample v1"
```

Deploy `helloworld-go` with:

```bash
$ kubectl apply -f helloworld-go.yaml
service "helloworld-go" created
```

### Interacting with helloworld-go App

```bash
$ kubectl get routes/helloworld-go --output=custom-columns=NAME:.metadata.name,DOMAIN:.status.domain
NAME            DOMAIN
helloworld-go   helloworld-go.default.example.com

$ kubectl get svc knative-ingressgateway --namespace istio-system --output 'jsonpath={.spec.ports[?(@.port==80)].nodePort}'
32380

$ curl -H "Host: helloworld-go.default.example.com" http://localhost:32380
Hello Go Sample v1!
```

Yay! We have `helloworld-go` application deployed and reachable.

Now, lets try and deploy one more application.

## Source Code in a Git Repository to a Running Application

### Install Kaniko Build Template

```bash
kubectl apply --filename https://raw.githubusercontent.com/knative/build-templates/master/kaniko/kaniko.yaml
buildtemplate "kaniko" created
```

### Register Secrets for Docker Hub

Use the following commands to generate base64 encoded values of Docker Hub username and password required to register a new `secret` in Kubernetes.

```bash
$ echo -n "your username" | base64 -b 0
eW91ciB1c2VybmFtZQ==

$ echo -n "your password" | base64 -b
0eW91ciBwYXNzd29yZA==
```

Create a new `secret` manifest named `docker-secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: basic-user-pass
  annotations:
    build.knative.dev/docker-0: https://index.docker.io/v1/
type: kubernetes.io/basic-auth
data:
  # Use 'echo -n "username" | base64 -b 0' to generate this string
  username:  eW91ciB1c2VybmFtZQ==
  # Use 'echo -n "password" | base64 -b 0' to generate this string
  password: 0eW91ciBwYXNzd29yZA==
```

Apply this manifest:

```bash
$ kubectl apply -f docker-secret.yaml
secret "basic-user-pass" created
```

Verify:

```bash
$ kubectl get secret
NAME                  TYPE                                  DATA      AGE
basic-user-pass       kubernetes.io/basic-auth              2         21s
...
```

### Create Service Account

Create a new `Service Account` manifest which is used to link the build process to the docker hub secret. Create `service-account.yaml` with:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: build-bot
secrets:
  - name: basic-user-pass
```

Apply `service account` manifest:

```bash
kubectl apply -f service-account.yaml
serviceaccount "build-bot" created
```

Verify:

```bash
$ kubectl get serviceaccount
NAME        SECRETS   AGE
build-bot   2         24s
default     1         4d
```

### Deploying the Application

**Note: We are deploying this application under `default` namespace. We had deployed `helloworld-go` under the same `default` namespace. We have noticed a limitation with Kubernetes on Docker which restricts number of pods under one single namespace. Please make sure that there are no pods exist under `default` and if they do, delete them all using `kubectl delete --all pods --namespace=default`**

Create a file named `service.yaml` and copy the following defintion. Make sure to replace `{DOCKER_USERNAME}` with your own Docker Hub username:

```yaml
apiVersion: serving.knative.dev/v1alpha1
kind: Service
metadata:
  name: app-from-source
  namespace: default
spec:
  runLatest:
    configuration:
      build:
        apiVersion: build.knative.dev/v1alpha1
        kind: Build
        spec:
          serviceAccountName: build-bot
          source:
            git:
              url: https://github.com/mchmarny/simple-app.git
              revision: master
          template:
            name: kaniko
            arguments:
              - name: IMAGE
                value: docker.io/{DOCKER_USERNAME}/app-from-source:latest
      revisionTemplate:
        spec:
          container:
            image: docker.io/{DOCKER_USERNAME}/app-from-source:latest
            imagePullPolicy: Always
            env:
              - name: SIMPLE_MSG
                value: "Hello from the sample app!"
```

Apply this manifest:

```bash
$ kubectl apply -f service.yaml
service "app-from-source" created
```

Verify:

```bash
$ kubectl get pods
NAME                                                    READY     STATUS    RESTARTS   AGE
app-from-source-00001-deployment-74c9cbdd6c-c6qzv   3/3       Running   0          24s
```

### Interacting with Service

```bash
$ kubectl get routes/app-from-source --output=custom-columns=NAME:.metadata.name,DOMAIN:.status.domain
NAME            DOMAIN
helloworld-go   app-from-source.default.example.com

$ kubectl get svc knative-ingressgateway --namespace istio-system --output 'jsonpath={.spec.ports[?(@.port==80)].nodePort}'
32380

$ curl -H "Host: app-from-source.default.example.com" http://localhost:32380
<h1>Hello from the sample app!</h1>
```

Hurray! We could deploy applications on Knative and interact with them. Watch this space for more experiments with Knative.
