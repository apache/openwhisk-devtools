# Maven Example


This example shows how to deploy a Java Action which has external dependency.  This 
example uses Maven as the dependency manager.

## Build 

```
./mvnw clean install
```

## Deploying the application to OpenWhisk

```
wsk -i action create md5hasher target/maven-java.jar --main org.apache.openwhisk.example.maven.App
```

## Invoking Action

```
wsk -i action invoke md5hasher --result -p text openwhisk 
```

Invoking the above action will return an JSON output which will have original plain text and MD5 hash of the same.

#### Output of above action:

```
{
    "md5": "803cd3a8fe96ceab1dc654dc6e41be5c",
    "text": "openwhisk"
}
```
