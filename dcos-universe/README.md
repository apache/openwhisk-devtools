# Mesosphere Universe Packages for OpenWhisk

[![Build Status](https://travis-ci.org/openwhisk/openwhisk-devtools.svg?branch=master)](https://travis-ci.org/openwhisk/openwhisk-devtools)

This is the source to generate DC/OS packages for OpenWhisk in the Mesosphere Universe.


## How to build and set up packages repository

1. In the universe home directory, run command `./scripts/build.sh`.

2. Upload `/target/repo-up-to-1.8.json` to a host service (e.g. AWS S3)

    * Make sure `Content-Type = application/vnd.dcos.universe.repo+json` in the file's headers.

3. In DC/OS admin console, under System > Overview > Repositories, add the link to the new repository.

## Installing the packages

Packages need to be install in this order:  

1. `apigateway`
2. `exhibitor`  
Notes: it could take up to 20 minutes for exhibitor instances to fully start up. Status can be monitored in the exhibitor console UI.
3. `kafka`: additional configurations are required. Example config.json:   

```
{
  "brokers": {
    "port": 9092
  },
  "kafka": {
    "kafka_zookeeper_uri": "exhibitor-dcos.marathon.mesos:31886",
    "default_replication_factor": 2
  }
}
```

4. `whisk-couchdb` (CouchDB container with populated data for a minimal setup of OpenWhisk).
5. `consul`
6. `registrator`
7. `whisk-controller`
8. `whisk-invoker`

## Supported DC/OS Versions

DC/OS v1.8 or later.
