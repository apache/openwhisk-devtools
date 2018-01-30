# Testing Java functions locally 

## Building CLI 
```bash
./gradlew jar
```

## Usage

```bash
java -jar ./build/libs/java-local.jar ./path-to-function.jar parameter=value parameter2=value2 --main=myproject.Myfunction
```

Will invoke the `main` function of `myproject.Myfunction` class from `path-to-function.jar` with following `params`:
```json
{
  "parameter":"value",
  "parameter2":"value"
}
```
Alternatively, you can test a single Java file by directly invoking it. In this case the Java file should not require any third party libraries.

```bash
java -jar ./build/libs/java-local.jar ./myproject/Myfunction.java parameter=value parameter2=value2 
```

This will always return a JSON formatted result that can be post-processed

It is also possible to pass input on stdin, this allows the creation of more complex input
objects that would be inconvenient to edit on the command line or passing non-string values.

```bash
echo '{"name": "value"}' | java -jar ./build/libs/java-local.jar ./path-to-function.jar --main=myproject.Myfunction
cat input.json | java -jar ./build/libs/java-local.jar ../myproject/Myfunction.java
```

