# OpenWhisk Update Maven Plugin for Java

This project automatically installs OpenWhisk actions, packages, rules and triggers based on Annotations added to Java classes.

## Pre-requisite

The following softwares are required to use this project:

* [Maven v3.3.x](https://maven.apache.org) or above
* Java 8 or above
* OpenWhisk CLI
* [openwhisk-annotations](../annotations/)

## Adding the Plugin

To enable the plugin in your Maven project, add the following into the build > plugins element within your pom.xml

```
<plugin>
    <groupId>org.apache.openwhisk</groupId>
    <artifactId>openwhisk-update-maven-plugin</artifactId>
    <version>[VERSION]</version>
    <executions>
        <execution>
            <goals>
                <goal>update</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <main>com.test.FunctionApp</main>
    </configuration>
</plugin>
```

## Deploying to OpenWhisk

When you build your code with `mvn clean install`, you should see log messages similar to the following:

```
[INFO] --- openwhisk-update-maven-plugin:0.0.1-SNAPSHOT:update (default) @ simple-email-function ---
[INFO] Updating OpenWhisk package test
[INFO] ok: updated package test
[INFO] Updating OpenWhisk action simple-function
[INFO] ok: updated action test/simple-function
[INFO] OpenWhisk Updates Successful!
```

This will indicate the status of the deployment to OpenWhisk. If the deployment fails, it will provide a log message with details on how to resolve. You can add the `-X` parameter to enable debug level logging in the plugin.

## FAQ

**How do I change the Whisk CLI Path?**

Add a parameter cli into the configuration element of the plugin with the path to the Whisk CLI for your environment, for example to support using BlueMix Functions:

```
<configuration>
  <cli>bx wsk</cli>
  <main>[...]</main>
</configuration>
```

**How do I update more than one class in my project in OpenWhisk?**

The main element is a comma-separated list of classes, the plugin will evaluate each class in the list and install anything defined in annotations. For example:

```
<configuration>
  <main>com.test.FunctionApp,com.test.FunctionApp2</main>
</configuration>
```
