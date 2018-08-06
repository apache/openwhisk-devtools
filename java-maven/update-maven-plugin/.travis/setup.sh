#!/bin/bash
set -x -e
uname -sm

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

# Build the parent so this compiles
mkdir -p $TOOLDIR/target
cd $TOOLDIR/target
git clone https://github.com/klcodanr/incubator-openwhisk-devtools.git
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -q clean install -f $TOOLDIR/target/incubator-openwhisk-devtools/java-maven/parent/pom.xml
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -q clean install -f $TOOLDIR/target/incubator-openwhisk-devtools/java-maven/annotations/pom.xml

cd $TOOLDIR

mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
