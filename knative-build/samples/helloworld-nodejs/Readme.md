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
