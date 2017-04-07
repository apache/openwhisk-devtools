#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
MESOSSCRIPTDIR="$SCRIPTDIR/../scripts/"

cd $MESOSSCRIPTDIR
./build.sh
