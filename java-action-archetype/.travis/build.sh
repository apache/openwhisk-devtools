#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

./mvnw -V test

#TODO steps that can push this artifact to nexus
