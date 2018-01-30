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

import com.google.gson.JsonObject;

import openwhisk.java.local.Launcher.Invoker;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Path;

/**
 * Parts copied from https://github.com/apache/incubator-openwhisk-runtime-java/blob/master/core/javaAction/proxy/src/main/java/openwhisk/java/action/JarLoader.java
 *
 */
public class JarLoader extends URLClassLoader implements Invoker{

  private Class<?> mainClass;
  private Method mainMethod;

  public JarLoader(Path jarPath, String entrypoint)
      throws MalformedURLException, ClassNotFoundException, NoSuchMethodException, SecurityException {
    super(new URL[] { jarPath.toUri().toURL() });

    final String[] splittedEntrypoint = entrypoint.split("#");
    final String entrypointClassName = splittedEntrypoint[0];
    final String entrypointMethodName = splittedEntrypoint.length > 1 ? splittedEntrypoint[1] : "main";

    this.mainClass = loadClass(entrypointClassName);

    Method m = mainClass.getMethod(entrypointMethodName, new Class[] { JsonObject.class });
    m.setAccessible(true);
    int modifiers = m.getModifiers();
    if (m.getReturnType() != JsonObject.class || !Modifier.isStatic(modifiers) || !Modifier.isPublic(modifiers)) {
      throw new NoSuchMethodException("main");
    }
    this.mainMethod = m;
  }

  @Override
  public JsonObject invokeMain(JsonObject arg) throws Exception {
    return (JsonObject) mainMethod.invoke(null, arg);
  }

}
