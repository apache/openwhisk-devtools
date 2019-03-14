#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one or more contributor
# license agreements; and to You under the Apache License, Version 2.0.

set -x -e
uname -sm

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

cd $TOOLDIR

mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
