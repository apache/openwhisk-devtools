#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one or more contributor
# license agreements; and to You under the Apache License, Version 2.0.

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

cd $TOOLDIR

mvn -V test

#TODO steps that can push this artifact to nexus
