/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package openwhisk.java.local;

import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.stream.JsonReader;

import picocli.CommandLine;
import picocli.CommandLine.Option;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Parameters;

/**
 * CLI
 */
public class CLI {

  @Parameters(index = "0", description = "The file to execute can be a .jar or .java file")
  private String binary;

  @Parameters(index = "1..*", description = "Parameters that are passed to function", paramLabel = "param=value")
  private Map<String, String> parameters;

  @Option(names = { "--main" }, required = false, description = "name of the main class, required if using .jar")
  private String mainClassName;

  public static void main(String[] args) {

    CLI cli = new CLI();
    try {
      CommandLine.populateCommand(cli, args);

      Path path = Paths.get(cli.binary).toRealPath();
      final boolean isJar = path.toString().endsWith(".jar");
      final boolean isJava = path.toString().endsWith(".java");
      if (!isJava && !isJar) {
        System.out.printf("%s is not a jar or java file\n", cli.binary);
        CommandLine.usage(cli, System.out);
        return;
      }

      File f = path.toFile();
      if (!f.canRead()) {
        System.out.printf("%s does not exist or can not be read\n", cli.binary);
        return;
      }

      Launcher launcher = new Launcher();
      launcher.setBinaryPath(path);
      launcher.setEntryClassName(cli.mainClassName);
      launcher.setParameter(readParameters(cli));
      JsonObject o = launcher.launch();
      Gson gson = new Gson();
      System.out.println(gson.toJson(o));
      System.exit(0);

    } catch (ParameterException e) {
      System.out.println(e.getMessage());
      CommandLine.usage(cli, System.out);
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  private static JsonObject readParameters(CLI cli) {
    if (cli.parameters == null || cli.parameters.isEmpty()) {
      ExecutorService ex = Executors.newSingleThreadExecutor();
      Future<JsonObject> result = ex.submit(() -> {
        try(JsonReader reader = new JsonReader(new InputStreamReader(System.in))){
          reader.setLenient(true);
          JsonParser parser = new JsonParser();
          JsonElement element = parser.parse(reader);
          return element.getAsJsonObject();
        }
      });
      try {
        return result.get(1, TimeUnit.SECONDS);
      } catch (InterruptedException | ExecutionException | TimeoutException e) {
        result.cancel(true);
        return new JsonObject();
      }

    } else {
      JsonObject o = new JsonObject();
      cli.parameters.forEach((name, value) -> {
        o.addProperty(name, value);
      });
      return o;
    }
  }
}
