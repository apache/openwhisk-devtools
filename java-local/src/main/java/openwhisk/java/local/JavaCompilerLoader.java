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
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileObject;
import javax.tools.JavaFileObject.Kind;
import javax.tools.StandardJavaFileManager;
import javax.tools.StandardLocation;
import javax.tools.ToolProvider;

import com.google.gson.JsonObject;

import openwhisk.java.local.Launcher.Invoker;

/**
 * JavaCompilerLoader
 */
public class JavaCompilerLoader extends ClassLoader implements Invoker {
  private MemoryFileManager fileManager;
  private Class<?> mainClass;
  private Method mainMethod;

  public JavaCompilerLoader(ClassLoader loader, Path sourcePath) {
    super(loader);
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    if (compiler == null) {
      throw new RuntimeException("No java compiler. Please use a JDK not a JRE!");
    }

    try {
      Path resolvedPath = sourcePath.toAbsolutePath();
      DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
      StandardJavaFileManager standardFileManager = compiler.getStandardFileManager(null, null, null);
      String packageName = findPackageName(resolvedPath);
      String fileName = sourcePath.getFileName().toString();
      String className = fileName.substring(0,fileName.length()-Kind.SOURCE.extension.length());
      if(!packageName.isEmpty())
      {
        className = packageName + '.' + className;
      }
      File sourceRoot = findSourceRoot(packageName, resolvedPath);
      standardFileManager.setLocation(StandardLocation.SOURCE_PATH, Collections.singleton(sourceRoot));

      JavaFileObject javaFile = standardFileManager.getJavaFileForInput(StandardLocation.SOURCE_PATH, className, Kind.SOURCE);
      if(javaFile == null ){
        System.err.printf("java file for classname does not exist file: %s\n", className);
        return;
      }
      fileManager = new MemoryFileManager(loader, standardFileManager);
      CompilationTask task = compiler.getTask(null, fileManager, diagnostics, Collections.singleton("-g"), null, Collections.singleton(javaFile));
      boolean valid = task.call();
      if (valid) {
        diagnostics.getDiagnostics().forEach(System.out::println);
      } else {
        diagnostics.getDiagnostics().forEach(System.err::println);
        throw new RuntimeException(String.format("Compilation for the file %s failed!\n",sourcePath.toString()));
      }

      this.mainClass = loadClass(className);

      Method m = mainClass.getMethod("main", new Class[] { JsonObject.class });
      m.setAccessible(true);
      int modifiers = m.getModifiers();
      if (m.getReturnType() != JsonObject.class || !Modifier.isStatic(modifiers) || !Modifier.isPublic(modifiers)) {
        throw new NoSuchMethodException("main");
      }
      this.mainMethod = m;

    } catch (IOException | ClassNotFoundException | NoSuchMethodException | SecurityException e) {
      e.printStackTrace();
    }
  }

  @Override
  public JsonObject invokeMain(JsonObject arg) throws Exception {
    return (JsonObject) mainMethod.invoke(null, arg);
  }

  @Override
  protected Class<?> findClass(String name) throws ClassNotFoundException {
    byte[] bytecode = getClassBytes(name);
    if (bytecode == null) {
      throw new ClassNotFoundException(name);
    }
    return defineClass(name, bytecode, 0, bytecode.length);
  }

  public byte[] getClassBytes(String name) {
    return fileManager.getCompiledClass(name);
  }

  private String findPackageName(Path sourcePath) throws IOException {
    List<String> lines = Files.readAllLines(sourcePath.toAbsolutePath(), StandardCharsets.UTF_8);
    for (String line : lines) {
      if(line.startsWith("package ")){
        int idx = line.indexOf("package ");
        return line.substring(line.indexOf(' ', idx), line.indexOf(';', idx)).trim();
      }
    }
    return "";
  }

  private File findSourceRoot(String packageName, Path sourcePath) throws IOException {
    int packageSections = Math.toIntExact(packageName.codePoints().filter(ch -> ch =='.').count()) + 1 ;
    packageSections++;//increment to include actual filename
    return sourcePath.getRoot().resolve(sourcePath.subpath(0, sourcePath.getNameCount()-packageSections)).toFile();
  }

}
