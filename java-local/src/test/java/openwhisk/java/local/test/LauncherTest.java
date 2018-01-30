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
package openwhisk.java.local.test;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;


import java.nio.file.Path;
import java.nio.file.Paths;
import org.junit.Test;

import com.google.gson.JsonObject;

import openwhisk.java.local.Launcher;

/**
 * LauncherTest
 */
public class LauncherTest {

  @Test
  public void testLauncherParameters(){
    Launcher launcher = new Launcher();
    final Path binaryPath = Paths.get("/");

    assertNull(launcher.getBinaryPath());
    launcher.setBinaryPath(binaryPath);
    assertTrue(launcher.getBinaryPath().isAbsolute());

    final String className = "clazzname";
    assertNull(launcher.getEntryClassName());
    launcher.setEntryClassName(className);
    assertSame(className, launcher.getEntryClassName());

    final JsonObject param = new JsonObject();
    assertNull(launcher.getParameter());
    launcher.setParameter(param);
    assertSame(param, launcher.getParameter());

  }

  @Test(expected=IllegalStateException.class)
  public void testLaunchJarNoMain() throws Exception{
    Launcher launcher = new Launcher();
    Path jarPath = Paths.get("someJar.jar");
    System.out.println(jarPath.toAbsolutePath().toString());
    launcher.setBinaryPath(jarPath);
    launcher.launch();
    fail();
  }


  @Test
  public void testRelativePathForJavaFile() throws Exception{
    Launcher launcher = new Launcher();
    Path filePath = Paths.get("./src/test/resources/aproject/App.java");
    launcher.setBinaryPath(filePath);
    JsonObject result = launcher.launch();
    assertNotNull(result);
  }

  @Test
  public void testAbsolutePathForJavaFile() throws Exception{
    Launcher launcher = new Launcher();
    Path filePath = Paths.get("./src/test/resources/aproject/App.java");
    launcher.setBinaryPath(filePath.toRealPath());
    JsonObject result = launcher.launch();
    assertNotNull(result);
  }



  @Test
  public void testAbsolutePathForJarLaunch() throws Exception{
    Launcher launcher = new Launcher();
    Path jarPath = Paths.get("./src/test/resources/serverlessJava.jar");
    launcher.setBinaryPath(jarPath.toRealPath());
    launcher.setEntryClassName("aproject.App");
    JsonObject result = launcher.launch();
    assertNotNull(result);
  }

  @Test
  public void testRelativePathForJarLaunch() throws Exception{
    Launcher launcher = new Launcher();
    Path jarPath = Paths.get("./src/test/resources/serverlessJava.jar");
    launcher.setBinaryPath(jarPath);
    launcher.setEntryClassName("aproject.App");
    JsonObject result = launcher.launch();
    assertNotNull(result);
  }
}

