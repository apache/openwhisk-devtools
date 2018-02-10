package org.apache.openwhisk.example.maven;

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
import java.nio.charset.Charset;

import com.google.common.hash.Hasher;
import com.google.common.hash.Hashing;
import com.google.gson.JsonObject;

public class App {
  public static JsonObject main(JsonObject args) {
    JsonObject response = new JsonObject();
    if (args.has("text")) {
      String text = args.getAsJsonPrimitive("text").getAsString();
      try {
        Hasher hasher = Hashing.md5().newHasher();
        hasher.putString(text.toString(), Charset.forName("UTF-8"));
        response.addProperty("text", text);
        response.addProperty("md5", hasher.hash().toString());
      } catch (Exception e) {
        response.addProperty("Error", e.getMessage());
      }
    }
    return response;
  }
}
