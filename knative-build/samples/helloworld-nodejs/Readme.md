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

## Step 1: Install npm package `express`

```bash
$ npm install express --save
```

## Build Docker Image

Build the container on your local machine with:

```bash
$ docker build -t {DOCKER_USERNAME}/helloworld-nodejs
```

## Push the container to docker registry

```bash
$ docker push {DOCKER_USERNAME}/helloworld-nodejs
```

## Apply Service YAML

```bash
$ kubectl apply -f service.yaml
```

## Access the service

```bash
curl -H "Host: helloworld-nodejs.default.example.com" http://localhost
Hello Node.js Sample v1!
```

## Logging

```bash
$ kubectl get pods helloworld-nodejs-00001-deployment-69f788f64b-gtvrc -o yaml
```

```bash
$ kubectl logs helloworld-nodejs-00001-deployment-69f788f64b-gtvrc --all-containers=true
```

```bash
$ kubectl logs helloworld-nodejs-00001-deployment-69f788f64b-gtvrc -c user-container

> knative-serving-helloworld-nodejs@1.0.0 start /usr/src/app
> node app.js

Hello world listening on port 8080
Hello world received a request.
```

```bash
$ kubectl logs helloworld-nodejs-00001-deployment-69f788f64b-gtvrc -c istio-init
```

```bash
kubectl exec nodejs-10-action-00003-deployment-65cd48975b-kbkwj -c istio-proxy -- ls -l
kubectl exec nodejs-10-action-00003-deployment-65cd48975b-kbkwj -c istio-proxy -- curl localhost:8080
```
