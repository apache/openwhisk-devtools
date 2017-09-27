#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
ROOTDIR="$SCRIPTDIR/../"

cd $ROOTDIR
PATH=$PATH:/usr/local/bin/ VERBOSE=true make quick-start stop
