#!/usr/bin/env bash

docker_prefix=${DOCKER_PREFIX}
docker_tag=${DOCKER_TAG:-snapshot-`date +'%Y%m%d-%H%M'`}
docker_registry=${DOCKER_REGISTRY}
openwhisk_prefix=${OPENWHISK_PREFIX:-whisk}

echo "docker_prefix=" ${docker_prefix}
echo "docker_tag=" ${docker_tag}
echo "docker_registry=" ${docker_registry}

function push_image {
    final_tag=${docker_registry}${docker_prefix}/$2:${docker_tag}
    echo "pushing $1 as ${docker_prefix}/$2 into ${final_tag}"

    docker tag $1 ${final_tag}
    docker push ${final_tag}
}

push_image whisk/controller whisk-controller
push_image whisk/invoker whisk-invoker
push_image adobeapiplatform/whisk-couchdb whisk-couchdb
push_image adobeapiplatform/nodejs6action nodejs6action
