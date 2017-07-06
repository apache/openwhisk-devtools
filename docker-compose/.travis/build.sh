#!/bin/bash
set +x
set +e

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../"

echo "SCRIPTDIR:" $SCRIPTDIR
echo "ROOTDIR:" $ROOTDIR

cd $ROOTDIR
PATH=$PATH:/usr/local/bin/ make quick-start stop
