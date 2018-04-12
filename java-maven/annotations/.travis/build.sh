#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

cd $TOOLDIR

mvn -V test

#TODO steps that can push this artifact to nexus
