#!/bin/bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
MESOSSCRIPTDIR="$SCRIPTDIR/../scripts/"

cd $MESOSSCRIPTDIR
pip install -r requirements/requirements.txt
./build.sh
