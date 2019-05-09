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

package actionContainers

import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import common.WskActorSystem
import spray.json.DefaultJsonProtocol._
import spray.json._
import actionContainers.ResourceHelpers.JarBuilder
import actionContainers.ActionContainer.withContainer

@RunWith(classOf[JUnitRunner])
class JavaActionContainerTests extends BasicActionRunnerTests with WskActorSystem {

  // Helpers specific to java actions
  override def withActionContainer(env: Map[String, String] = Map.empty)(
    code: ActionContainer => Unit): (String, String) = withContainer("java8action", env)(code)

  behavior of "Java action"

  override val testNoSourceOrExec = {
    TestConfig("")
  }

  override val testNotReturningJson = {
    // skip this test since and add own below (see Nuller)
    TestConfig("", skipTest = true)
  }

  override val testEnv = {
    TestConfig(
      JarBuilder.mkBase64Jar(
        Seq("example", "HelloWhisk.java") ->
          """
          | package example;
          |
          | import com.google.gson.JsonObject;
          |
          | public class HelloWhisk {
          |     public static JsonObject main(JsonObject args) {
          |         JsonObject response = new JsonObject();
          |         response.addProperty("api_host", System.getenv("__OW_API_HOST"));
          |         response.addProperty("api_key", System.getenv("__OW_API_KEY"));
          |         response.addProperty("namespace", System.getenv("__OW_NAMESPACE"));
          |         response.addProperty("action_name", System.getenv("__OW_ACTION_NAME"));
          |         response.addProperty("activation_id", System.getenv("__OW_ACTIVATION_ID"));
          |         response.addProperty("deadline", System.getenv("__OW_DEADLINE"));
          |         return response;
          |     }
          | }
        """.stripMargin.trim),
      main = "example.HelloWhisk")
  }

  override val testEcho = {
    TestConfig(
      JarBuilder.mkBase64Jar(
        Seq("example", "HelloWhisk.java") ->
          """
          | package example;
          |
          | import com.google.gson.JsonObject;
          |
          | public class HelloWhisk {
          |     public static JsonObject main(JsonObject args) {
          |         System.out.println("hello stdout");
          |         System.err.println("hello stderr");
          |         return args;
          |     }
          | }
        """.stripMargin.trim),
      "example.HelloWhisk")
  }

  override val testUnicode = {
    TestConfig(
      JarBuilder.mkBase64Jar(
        Seq("example", "HelloWhisk.java") ->
          """
          | package example;
          |
          | import com.google.gson.JsonObject;
          |
          | public class HelloWhisk {
          |     public static JsonObject main(JsonObject args) {
          |         String delimiter = args.getAsJsonPrimitive("delimiter").getAsString();
          |         JsonObject response = new JsonObject();
          |          String str = delimiter + " ☃ " + delimiter;
          |          System.out.println(str);
          |          response.addProperty("winter", str);
          |          return response;
          |     }
          | }
        """.stripMargin),
      "example.HelloWhisk")
  }

  def echo(main: String = "main") = {
    JarBuilder.mkBase64Jar(
      Seq("example", "HelloWhisk.java") ->
        s"""
        | package example;
        |
        | import com.google.gson.JsonObject;
        |
        | public class HelloWhisk {
        |     public static JsonObject $main(JsonObject args) {
        |         return args;
        |     }
        | }
      """.stripMargin.trim)
  }

  override val testInitCannotBeCalledMoreThanOnce = {
    TestConfig(echo(), "example.HelloWhisk")
  }

  override val testEntryPointOtherThanMain = {
    TestConfig(echo("naim"), "example.HelloWhisk#naim")
  }

  override val testLargeInput = {
    TestConfig(echo(), "example.HelloWhisk")
  }

  Seq("", "x", "!", "#", "#main", "#bogus").foreach { m =>
    it should s"report an error if explicit 'main' is not found ($m)" in {
      val (out, err) = withActionContainer() { c =>
        val (initCode, out) = c.init(initPayload(echo("hello"), s"example.HelloWhisk$m"))
        initCode shouldBe 502

        out shouldBe {
          val error = m match {
            case c if c == "x" || c == "!" => s"java.lang.ClassNotFoundException: example.HelloWhisk$c"
            case "#bogus"                  => "java.lang.NoSuchMethodException: example.HelloWhisk.bogus(com.google.gson.JsonObject)"
            case _                         => "java.lang.NoSuchMethodException: example.HelloWhisk.main(com.google.gson.JsonObject)"
          }
          Some(JsObject("error" -> s"An error has occurred (see logs for details): $error".toJson))
        }
      }

      checkStreams(out, err, {
        case (o, e) =>
          o shouldBe empty
          e should not be empty
      })
    }
  }

  it should "fail to initialize with bad code" in {
    val (out, err) = withActionContainer() { c =>
      // This is valid zip file containing a single file, but not a valid
      // jar file.
      val brokenJar = ("UEsDBAoAAAAAAPxYbkhT4iFbCgAAAAoAAAANABwAbm90YWNsYXNzZmlsZVV" +
        "UCQADzNPmVszT5lZ1eAsAAQT1AQAABAAAAABzYXVjaXNzb24KUEsBAh4DCg" +
        "AAAAAA/FhuSFPiIVsKAAAACgAAAA0AGAAAAAAAAQAAAKSBAAAAAG5vdGFjb" +
        "GFzc2ZpbGVVVAUAA8zT5lZ1eAsAAQT1AQAABAAAAABQSwUGAAAAAAEAAQBT" +
        "AAAAUQAAAAAA")

      val (initCode, _) = c.init(initPayload(brokenJar, "example.Broken"))
      initCode should not be (200)
    }

    // Somewhere, the logs should contain an exception.
    checkStreams(out, err, {
      case (o, e) =>
        (o + e).toLowerCase should include("exception")
    })
  }

  it should "return some error on action error" in {
    val (out, err) = withActionContainer() { c =>
      val jar = JarBuilder.mkBase64Jar(
        Seq("example", "HelloWhisk.java") ->
          """
            | package example;
            |
            | import com.google.gson.JsonObject;
            |
            | public class HelloWhisk {
            |     public static JsonObject main(JsonObject args) throws Exception {
            |         throw new Exception("noooooooo");
            |     }
            | }
          """.stripMargin.trim)

      val (initCode, _) = c.init(initPayload(jar, "example.HelloWhisk"))
      initCode should be(200)

      val (runCode, runRes) = c.run(runPayload(JsObject.empty))
      runCode should not be (200)

      runRes shouldBe defined
      runRes.get.fields.get("error") shouldBe defined
    }

    checkStreams(out, err, {
      case (o, e) =>
        (o + e).toLowerCase should include("exception")
    })
  }

  it should "support application errors" in {
    val (out, err) = withActionContainer() { c =>
      val jar = JarBuilder.mkBase64Jar(
        Seq("example", "Error.java") ->
          """
            | package example;
            |
            | import com.google.gson.JsonObject;
            |
            | public class Error {
            |     public static JsonObject main(JsonObject args) throws Exception {
            |         JsonObject error = new JsonObject();
            |         error.addProperty("error", "This action is unhappy.");
            |         return error;
            |     }
            | }
          """.stripMargin.trim)

      val (initCode, _) = c.init(initPayload(jar, "example.Error"))
      initCode should be(200)

      val (runCode, runRes) = c.run(runPayload(JsObject.empty))
      runCode should be(200) // action writer returning an error is OK

      runRes shouldBe defined
      runRes.get.fields.get("error") shouldBe defined
    }

    checkStreams(out, err, {
      case (o, e) =>
        o shouldBe empty
        e shouldBe empty
    })
  }

  it should "support main in default package" in {
    val (out, err) = withActionContainer() { c =>
      val jar = JarBuilder.mkBase64Jar(
        Seq("", "HelloWhisk.java") ->
          """
            | import com.google.gson.JsonObject;
            |
            | public class HelloWhisk {
            |     public static JsonObject main(JsonObject args) throws Exception {
            |         return args;
            |     }
            | }
          """.stripMargin.trim)

      val (initCode, _) = c.init(initPayload(jar, "HelloWhisk"))
      initCode should be(200)

      val args = JsObject("a" -> "A".toJson)
      val (runCode, runRes) = c.run(runPayload(args))
      runCode should be(200)
      runRes shouldBe Some(args)
    }

    checkStreams(out, err, {
      case (o, e) =>
        o shouldBe empty
        e shouldBe empty
    })
  }

  it should "survive System.exit" in {
    val (out, err) = withActionContainer() { c =>
      val jar = JarBuilder.mkBase64Jar(
        Seq("example", "Quitter.java") ->
          """
            | package example;
            |
            | import com.google.gson.*;
            |
            | public class Quitter {
            |     public static JsonObject main(JsonObject main) {
            |         System.exit(1);
            |         return new JsonObject();
            |     }
            | }
          """.stripMargin.trim)

      val (initCode, _) = c.init(initPayload(jar, "example.Quitter"))
      initCode should be(200)

      val (runCode, runRes) = c.run(runPayload(JsObject.empty))
      runCode should not be (200)

      runRes shouldBe defined
      runRes.get.fields.get("error") shouldBe defined
    }

    checkStreams(out, err, {
      case (o, e) =>
        (o + e).toLowerCase should include("system.exit")
    })
  }

  it should "enforce that the user returns an object" in {
    val (out, err) = withActionContainer() { c =>
      val jar = JarBuilder.mkBase64Jar(
        Seq("example", "Nuller.java") ->
          """
            | package example;
            |
            | import com.google.gson.*;
            |
            | public class Nuller {
            |     public static JsonObject main(JsonObject args) {
            |         return null;
            |     }
            | }
          """.stripMargin.trim)

      val (initCode, _) = c.init(initPayload(jar, "example.Nuller"))
      initCode should be(200)

      val (runCode, runRes) = c.run(runPayload(JsObject.empty))
      runCode should not be (200)

      runRes shouldBe defined
      runRes.get.fields.get("error") shouldBe defined
    }

    checkStreams(out, err, {
      case (o, e) =>
        (o + e).toLowerCase should include("the action returned null")
    })
  }

  val dynamicLoadingJar = JarBuilder.mkBase64Jar(
    Seq(
      Seq("example", "EntryPoint.java") ->
        """
          | package example;
          |
          | import com.google.gson.*;
          | import java.lang.reflect.*;
          |
          | public class EntryPoint {
          |     private final static String CLASS_NAME = "example.DynamicClass";
          |     public static JsonObject main(JsonObject args) throws Exception {
          |         String cl = args.getAsJsonPrimitive("classLoader").getAsString();
          |
          |         Class d = null;
          |         if("local".equals(cl)) {
          |             d = Class.forName(CLASS_NAME);
          |         } else if("thread".equals(cl)) {
          |             d = Thread.currentThread().getContextClassLoader().loadClass(CLASS_NAME);
          |         }
          |
          |         Object o = d.newInstance();
          |         Method m = o.getClass().getMethod("getMessage");
          |         String msg = (String)m.invoke(o);
          |
          |         JsonObject response = new JsonObject();
          |         response.addProperty("message", msg);
          |         return response;
          |     }
          | }
        """.stripMargin.trim,
      Seq("example", "DynamicClass.java") ->
        """
          | package example;
          |
          | public class DynamicClass {
          |     public String getMessage() {
          |         return "dynamic!";
          |     }
          | }
        """.stripMargin.trim))

  def classLoaderTest(param: String) = {
    val (out, err) = withActionContainer() { c =>
      val (initCode, _) = c.init(initPayload(dynamicLoadingJar, "example.EntryPoint"))
      initCode should be(200)

      val (runCode, runRes) = c.run(runPayload(JsObject("classLoader" -> JsString(param))))
      runCode should be(200)

      runRes shouldBe defined
      runRes.get.fields.get("message") shouldBe Some(JsString("dynamic!"))
    }

    checkStreams(out, err, {
      case (o, e) =>
        o shouldBe empty
        e shouldBe empty
    })
  }

  it should "support loading classes from the current classloader" in {
    classLoaderTest("local")
  }

  it should "support loading classes from the Thread classloader" in {
    classLoaderTest("thread")
  }
}
