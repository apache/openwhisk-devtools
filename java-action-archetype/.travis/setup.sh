#!/bin/bash
set -x -e
uname -sm

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

mvn -B clean install -DskipTests=true
