```bash
kubectl apply -f service.yaml
service.serving.knative.dev/nodejs-10-runtime created
```

```bash
kubectl get pods
NAME                                                  READY   STATUS    RESTARTS   AGE
nodejs-10-runtime-00001-deployment-75744dbfd7-j5snf   2/3     Running   3          68s
```

```bash
kubectl get pods nodejs-10-runtime-00001-deployment-75744dbfd7-j5snf -o yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    sidecar.istio.io/inject: "true"
    sidecar.istio.io/status: '{"version":"2153b4a1c36b2db7abd8141cba9723db658c4a56673d25af8d1d18641270f3a2","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
    traffic.sidecar.istio.io/includeOutboundIPRanges: '*'
  creationTimestamp: "2019-01-28T19:29:00Z"
  generateName: nodejs-10-runtime-00001-deployment-75744dbfd7-
  labels:
    app: nodejs-10-runtime-00001
    pod-template-hash: 75744dbfd7
    serving.knative.dev/configuration: nodejs-10-runtime
    serving.knative.dev/configurationGeneration: "1"
    serving.knative.dev/configurationMetadataGeneration: "1"
    serving.knative.dev/revision: nodejs-10-runtime-00001
    serving.knative.dev/revisionUID: f4abe4d0-2332-11e9-8abf-025000000001
    serving.knative.dev/service: nodejs-10-runtime
  name: nodejs-10-runtime-00001-deployment-75744dbfd7-j5snf
  namespace: default
  ownerReferences:
  - apiVersion: apps/v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicaSet
    name: nodejs-10-runtime-00001-deployment-75744dbfd7
    uid: f6985495-2332-11e9-8abf-025000000001
  resourceVersion: "69700"
  selfLink: /api/v1/namespaces/default/pods/nodejs-10-runtime-00001-deployment-75744dbfd7-j5snf
  uid: f69e3e29-2332-11e9-8abf-025000000001
spec:
  containers:
  - env:
    - name: TARGET
      value: Node.js Sample v1
    - name: PORT
      value: "8080"
    - name: K_REVISION
      value: nodejs-10-runtime-00001
    - name: K_CONFIGURATION
      value: nodejs-10-runtime
    - name: K_SERVICE
      value: nodejs-10-runtime
    image: index.docker.io/openwhisk/nodejsactionbase@sha256:c0e903ada3dcf0f3755a8dd1e4efd41a559fd1f6d18c1880e6a241df251aa8b9
    imagePullPolicy: IfNotPresent
    lifecycle:
      preStop:
        httpGet:
          path: quitquitquit
          port: 8022
          scheme: HTTP
    name: user-container
    ports:
    - containerPort: 8080
      name: user-port
      protocol: TCP
    resources:
      requests:
        cpu: 400m
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: FallbackToLogsOnError
    volumeMounts:
    - mountPath: /var/log
      name: varlog
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: default-token-w8j46
      readOnly: true
  - env:
    - name: SERVING_NAMESPACE
      value: default
    - name: SERVING_CONFIGURATION
      value: nodejs-10-runtime
    - name: SERVING_REVISION
      value: nodejs-10-runtime-00001
    - name: SERVING_AUTOSCALER
      value: autoscaler
    - name: SERVING_AUTOSCALER_PORT
      value: "8080"
    - name: CONTAINER_CONCURRENCY
      value: "0"
    - name: REVISION_TIMEOUT_SECONDS
      value: "300"
    - name: SERVING_POD
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    - name: SERVING_LOGGING_CONFIG
      value: |
        {
          "level": "info",
          "development": false,
          "outputPaths": ["stdout"],
          "errorOutputPaths": ["stderr"],
          "encoding": "json",
          "encoderConfig": {
            "timeKey": "ts",
            "levelKey": "level",
            "nameKey": "logger",
            "callerKey": "caller",
            "messageKey": "msg",
            "stacktraceKey": "stacktrace",
            "lineEnding": "",
            "levelEncoder": "",
            "timeEncoder": "iso8601",
            "durationEncoder": "",
            "callerEncoder": ""
          }
        }
    - name: SERVING_LOGGING_LEVEL
      value: info
    - name: USER_PORT
      value: "8080"
    image: gcr.io/knative-releases/github.com/knative/serving/cmd/queue@sha256:fc49125cb29f7bb2de2c4d6bd51153ce190cb522cf42df59898147d2074885cc
    imagePullPolicy: IfNotPresent
    lifecycle:
      preStop:
        httpGet:
          path: quitquitquit
          port: 8022
          scheme: HTTP
    name: queue-proxy
    ports:
    - containerPort: 8012
      name: queue-port
      protocol: TCP
    - containerPort: 8022
      name: queueadm-port
      protocol: TCP
    - containerPort: 9090
      name: queue-metrics
      protocol: TCP
    readinessProbe:
      failureThreshold: 3
      httpGet:
        path: health
        port: 8022
        scheme: HTTP
      periodSeconds: 1
      successThreshold: 1
      timeoutSeconds: 1
    resources:
      requests:
        cpu: 25m
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: default-token-w8j46
      readOnly: true
  - args:
    - proxy
    - sidecar
    - --configPath
    - /etc/istio/proxy
    - --binaryPath
    - /usr/local/bin/envoy
    - --serviceCluster
    - nodejs-10-runtime-00001
    - --drainDuration
    - 45s
    - --parentShutdownDuration
    - 1m0s
    - --discoveryAddress
    - istio-pilot.istio-system:15007
    - --discoveryRefreshDelay
    - 1s
    - --zipkinAddress
    - zipkin.istio-system:9411
    - --connectTimeout
    - 10s
    - --statsdUdpAddress
    - istio-statsd-prom-bridge.istio-system:9125
    - --proxyAdminPort
    - "15000"
    - --controlPlaneAuthPolicy
    - NONE
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.namespace
    - name: INSTANCE_IP
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: status.podIP
    - name: ISTIO_META_POD_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    - name: ISTIO_META_INTERCEPTION_MODE
      value: REDIRECT
    image: docker.io/istio/proxyv2:1.0.2
    imagePullPolicy: IfNotPresent
    lifecycle:
      preStop:
        exec:
          command:
          - sh
          - -c
          - sleep 20; until curl -s localhost:15000/clusters | grep "inbound|80|"
            | grep "rq_active" | grep "rq_active::0"; do sleep 1; done;
    name: istio-proxy
    resources:
      requests:
        cpu: 10m
    securityContext:
      procMount: Default
      readOnlyRootFilesystem: true
      runAsUser: 1337
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /etc/istio/proxy
      name: istio-envoy
    - mountPath: /etc/certs/
      name: istio-certs
      readOnly: true
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  initContainers:
  - args:
    - -p
    - "15001"
    - -u
    - "1337"
    - -m
    - REDIRECT
    - -i
    - '*'
    - -x
    - ""
    - -b
    - 8080, 8012, 8022, 9090,
    - -d
    - ""
    image: docker.io/istio/proxy_init:1.0.2
    imagePullPolicy: IfNotPresent
    name: istio-init
    resources: {}
    securityContext:
      capabilities:
        add:
        - NET_ADMIN
      procMount: Default
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
  nodeName: docker-desktop
  priority: 0
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: default
  serviceAccountName: default
  terminationGracePeriodSeconds: 300
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300
  volumes:
  - emptyDir: {}
    name: varlog
  - name: default-token-w8j46
    secret:
      defaultMode: 420
      secretName: default-token-w8j46
  - emptyDir:
      medium: Memory
    name: istio-envoy
  - name: istio-certs
    secret:
      defaultMode: 420
      optional: true
      secretName: istio.default
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2019-01-28T19:29:02Z"
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: "2019-01-28T19:29:26Z"
    message: 'containers with unready status: [user-container]'
    reason: ContainersNotReady
    status: "False"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: "2019-01-28T19:29:26Z"
    message: 'containers with unready status: [user-container]'
    reason: ContainersNotReady
    status: "False"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: "2019-01-28T19:29:00Z"
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: docker://c2b5f9e6ac2f52576a4519161fb4b5a34ef302568637da94d3a227e069acce00
    image: istio/proxyv2:1.0.2
    imageID: docker-pullable://istio/proxyv2@sha256:54e206530ba6ca9b3820254454e01b7592e9f986d27a5640b6c03704b3b68332
    lastState: {}
    name: istio-proxy
    ready: true
    restartCount: 0
    state:
      running:
        startedAt: "2019-01-28T19:29:10Z"
  - containerID: docker://8e5238c7765aedc89522f9441fff365c0a879f2a0338be970cac5c8cf44df036
    image: sha256:6cb5d12d6ec5e0f951a54fa344c9646fbb96287fb6b0129388b75a6342b67157
    imageID: docker-pullable://gcr.io/knative-releases/github.com/knative/serving/cmd/queue@sha256:fc49125cb29f7bb2de2c4d6bd51153ce190cb522cf42df59898147d2074885cc
    lastState: {}
    name: queue-proxy
    ready: true
    restartCount: 0
    state:
      running:
        startedAt: "2019-01-28T19:29:09Z"
  - containerID: docker://4ded5fe0044998cb163526317c595804a66e7369a3f836a01ddeb2149b14b6a7
    image: sha256:e3cf12050d36bb6d672fb3c15ed98883374feb747fdbe66dbcb33306d0a6a9d9
    imageID: docker-pullable://openwhisk/nodejsactionbase@sha256:c0e903ada3dcf0f3755a8dd1e4efd41a559fd1f6d18c1880e6a241df251aa8b9
    lastState:
      terminated:
        containerID: docker://17a0d9871afa5570bcfc6a68e8a25313bc97e16ccf9711ffbfadaa943e74faab
        exitCode: 0
        finishedAt: "2019-01-28T19:29:51Z"
        reason: Completed
        startedAt: "2019-01-28T19:29:51Z"
    name: user-container
    ready: false
    restartCount: 4
    state:
      terminated:
        containerID: docker://4ded5fe0044998cb163526317c595804a66e7369a3f836a01ddeb2149b14b6a7
        exitCode: 0
        finishedAt: "2019-01-28T19:30:34Z"
        reason: Completed
        startedAt: "2019-01-28T19:30:34Z"
  hostIP: 192.168.65.3
  initContainerStatuses:
  - containerID: docker://cb386be55ca7741b0631534f95d2860917f9fc88e7f3c2e166f4450a9ee8c464
    image: istio/proxy_init:1.0.2
    imageID: docker-pullable://istio/proxy_init@sha256:e16a0746f46cd45a9f63c27b9e09daff5432e33a2d80c8cc0956d7d63e2f9185
    lastState: {}
    name: istio-init
    ready: true
    restartCount: 0
    state:
      terminated:
        containerID: docker://cb386be55ca7741b0631534f95d2860917f9fc88e7f3c2e166f4450a9ee8c464
        exitCode: 0
        finishedAt: "2019-01-28T19:29:01Z"
        reason: Completed
        startedAt: "2019-01-28T19:29:01Z"
  phase: Running
  podIP: 10.1.0.119
  qosClass: Burstable
  startTime: "2019-01-28T19:29:00Z"
```
  
```bash
curl -H "Host: nodejs-10-runtime.default.example.com" http://localhost
curl: (52) Empty reply from server
```
NodeJS 10:

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- curl localhost:8080
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /</pre>
</body>
</html>
100   139  100   139    0     0  19806      0 --:--:-- --:--:-- --:--:-- 23166
```

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- ls -1
CHANGELOG.md
app.js
package.json
runner.js
src
```

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- ./app.js
OCI runtime exec failed: exec failed: container_linux.go:344: starting container process caused "exec: \"./app.js\": permission denied": unknown
command terminated with exit code 126
```

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- pwd
/nodejsAction
```

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- ps -eaf
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 19:51 ?        00:00:00 /bin/sh -c node --expose-gc app.js
root         7     1  0 19:51 ?        00:00:00 node --expose-gc app.js
root        49     0  0 19:59 ?        00:00:00 ps -eaf
```

```bash
kubectl exec nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd -c user-container -- env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=nodejs-10-runtime-00001-deployment-5c5bf68cd5-26qhd
PORT=8080
K_REVISION=nodejs-10-runtime-00001
K_CONFIGURATION=nodejs-10-runtime
K_SERVICE=nodejs-10-runtime
TARGET=Node.js Sample v1
NODEJS_10_RUNTIME_00001_SERVICE_PORT_9090_TCP=tcp://10.107.253.143:9090
NODEJS_10_RUNTIME_00001_SERVICE_PORT_9090_TCP_PROTO=tcp
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_PROTO=tcp
NODEJS_10_RUNTIME_00001_SERVICE_SERVICE_HOST=10.107.253.143
NODEJS_10_RUNTIME_00001_SERVICE_SERVICE_PORT_HTTP=80
NODEJS_10_RUNTIME_00001_SERVICE_SERVICE_PORT_METRICS=9090
NODEJS_10_RUNTIME_00001_SERVICE_PORT_80_TCP_ADDR=10.107.253.143
NODEJS_10_RUNTIME_00001_SERVICE_PORT_9090_TCP_ADDR=10.107.253.143
KUBERNETES_SERVICE_PORT_HTTPS=443
NODEJS_10_RUNTIME_00001_SERVICE_SERVICE_PORT=80
NODEJS_10_RUNTIME_00001_SERVICE_PORT=tcp://10.107.253.143:80
NODEJS_10_RUNTIME_00001_SERVICE_PORT_80_TCP_PROTO=tcp
NODEJS_10_RUNTIME_00001_SERVICE_PORT_80_TCP_PORT=80
KUBERNETES_SERVICE_PORT=443
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
NODEJS_10_RUNTIME_00001_SERVICE_PORT_80_TCP=tcp://10.107.253.143:80
NODEJS_10_RUNTIME_00001_SERVICE_PORT_9090_TCP_PORT=9090
KUBERNETES_PORT_443_TCP_PORT=443
NODE_VERSION=10.15.0
YARN_VERSION=1.12.3
HOME=/root
```
