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

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.PathMatcher;

import com.google.gson.JsonObject;

/**
 * Local launcher for openwhisk functions
 *
 */
public class Launcher {

  private Path binaryPath;
  private JsonObject parameter;
  private String entryClassName;
  private static PathMatcher JAVA_FILE_MATCHER = FileSystems.getDefault().getPathMatcher("glob:**.java");

  public interface Invoker {
    public JsonObject invokeMain(JsonObject arg) throws Exception;
  }

  /**
   * @return the binaryPath
   */
  public Path getBinaryPath() {
    return binaryPath;
  }

  /**
   * @param binaryPath the binaryPath to set
   */
  public void setBinaryPath(Path binaryPath) {
    try {
      this.binaryPath = binaryPath.toRealPath();
    } catch (IOException e) {
      this.binaryPath = binaryPath;
    }
  }

  /**
   * @return the parameters
   */
  public JsonObject getParameter() {
    return parameter;
  }

  /**
   * @param parameters the parameters to set
   */
  public void setParameter(JsonObject parameter) {
    this.parameter = parameter;
  }

  /**
   * @return the entryClassName
   */
  public String getEntryClassName() {
    return entryClassName;
  }

  /**
   * @param entryClassName the entryClassName to set
   */
  public void setEntryClassName(String entryClassName) {
    this.entryClassName = entryClassName;
  }

  public JsonObject launch() throws Exception {
    Invoker invoker;
    ClassLoader loader;
    if (JAVA_FILE_MATCHER.matches(this.binaryPath)) {
      loader = new JavaCompilerLoader(Thread.currentThread().getContextClassLoader(), this.getBinaryPath());
      invoker = (Invoker) loader;
    } else {
      if (getEntryClassName() == null) {
        throw new IllegalStateException("Main class name is required to execute .jar");
      }
      loader = new JarLoader(this.getBinaryPath(), getEntryClassName());
      invoker = (Invoker) loader;
    }
    Thread.currentThread().setContextClassLoader(loader);
    JsonObject args = getParameter();
    if (args == null) {
      args = new JsonObject(); //always pass an argument
    }
    return invoker.invokeMain(args);
  }

}
