#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

mvn -B clean install

#TODO steps that can push this artifact to nexus
