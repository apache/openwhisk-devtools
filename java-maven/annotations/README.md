# OpenWhisk Annotations for Java

This module is part of the [Apache OpenWhisk](http://openwhisk.incubator.apache.org/) project.

This project allows developers to define actions, packages, rules and triggers from annotations on java classes.

## Pre-requisite

The following softwares are required to use this project:

* [Maven v3.3.x](https://maven.apache.org) or above
* Java 8 or above
* OpenWhisk CLI
* [openwhisk-update-maven-plugin](../update-maven-plugin/)

## Adding the Annotations

All of the annotations are added at the class level. You can define more than one annotation per class.

### Action Annotation

The `@Action` annotation defines an OpenWhisk [action](https://github.com/apache/incubator-openwhisk/blob/master/docs/actions.md):

```
@Action(name = "simple-function", packageName = "test", parameters = { @Parameter(key = "Name", value = "Bob") })
public class FunctionApp {
```

### Package Annotation

The `@Package` annotation defines an OpenWhisk [package](https://github.com/apache/incubator-openwhisk/blob/master/docs/packages.md):

```
@Package(name = "test")
public class FunctionApp {
```

Our recommendation would be to add this to a package-info.java class for the package containing the actions / code for a particular package.

### Rule Annotation

The `@Rule` annotation defines an OpenWhisk [rule](https://github.com/apache/incubator-openwhisk/blob/master/docs/triggers_rules.md):

```
@Rule(actionName="test/simple-function", name = "dostuffrule", packageName = "test", triggerName="test/dostuff")
public class FunctionApp {
```


### Trigger Annotation

The `@Trigger` annotation defines an OpenWhisk [trigger](https://github.com/apache/incubator-openwhisk/blob/master/docs/triggers_rules.md):

```
@Trigger(feed = "/whisk.system/alarms/alarm", name = "dostuff", packageName = "test", parameters = { @Parameter(key = "cron", value = "5 * * * *")})
public class FunctionApp {
```
