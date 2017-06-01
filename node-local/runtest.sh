#!/bin/bash

pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null

action_executor="$SCRIPTPATH/test.js"
actionimage="openwhisk/nodejs6action:latest"
debug_env="debug_disabled"


while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    --target)
    action="$2"
    shift # past argument
    ;;
    --param)
    params="$2"
    shift # past argument
    ;;
    --image)
    actionimage="$2"
    shift # past argument
    ;;
    --debug)
    debug_env="NODE_DEBUG=request"
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
done

echo "#######################################################"
echo "Testing action $target_action_file using image $actionimage"
echo "#######################################################"

docker run --name="actiontest" --rm -it \
    -e "$debug_env" \
    -v "$action_executor:/nodejsAction/testexecutor.js" \
    -v "$action:/nodejsAction/testaction.js" \
    "$actionimage" node testexecutor.js ./testaction.js "$params"
