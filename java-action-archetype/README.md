# Maven Archetype for Java Action

This archetype helps to generate the JavaAction template project

## Generate project 

```sh
mvn archetype:generate \
  -DarchetypeGroupId=org.apache.openwhisk.java \
  -DarchetypeArtifactId=java-action-archetype \
  -DarchetypeVersion=1.0-SNAPSHOT \
  -DgroupId=com.example \
  -DartifactId=demo-function
```