#!/bin/bash
set -x -e
uname -sm

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
TOOLDIR="$SCRIPTDIR/../"

# Build the parent so this compiles
mkdir -p $TOOLDIR/target
cd $TOOLDIR/target
git clone https://github.com/klcodanr/incubator-openwhisk-devtools.git
cd $TOOLDIR/target/incubator-openwhisk-devtools/java-maven/parent
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
cd $TOOLDIR/target/incubator-openwhisk-devtools/java-maven/annotations
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
cd $TOOLDIR/target/incubator-openwhisk-devtools/java-maven/update-maven-plugin
mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install

cd $TOOLDIR

mvn -DskipTests=true -Dmaven.javadoc.skip=true -B -V clean install
