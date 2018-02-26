#!/bin/bash
set -x -e
uname -sm

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

cd $TOOLDIR

mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
