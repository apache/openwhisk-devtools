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
package org.apache.openwhisk;

import java.util.*;
import java.io.*;
import org.apache.commons.cli.*;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONObject;

import org.apache.commons.io.FileUtils;

/**
 * WhiskSim
 */

// Formatter: https://github.com/redhat-developer/vscode-java/wiki/Formatter-settings
public class App
{
    private JSONObject readJSON(String filename) throws Exception {
        File file = new File(filename);
        String content = FileUtils.readFileToString(file, "utf-8");

        // Convert JSON string to JSONObject
        JSONObject objJSON = new JSONObject(content);

        return (objJSON);
    }

    public static void main( String[] args )
    {
        System.out.printf("main(String[] args): %s\n", Arrays.toString(args));

        // https://commons.apache.org/proper/commons-cli/javadocs/api-release/index.html
        // https://commons.apache.org/proper/commons-cli/usage.html
        // https://dzone.com/articles/java-command-line-interfaces-part-1-apache-commons
        // Option(String opt, String longOpt, boolean hasArg, String description)
        try {

            System.out.println("Working Directory=[" +
              System.getProperty("user.dir") + "]");

            // create Options object
            Options options = new Options();

            // add "Boolean"" options
            Option help = new Option( "h", "help", false, "print utility help" );
            Option verbose = new Option( "v", "verbose", false, "enable verbose output" );

            // Add "Argument" options
            Option payload = Option.builder("p")
            .hasArg()
            .desc("Payload file to use in the HTTP request body")
            .required(true)
            .longOpt("payload")
            .build();

            // Add all the options
            options.addOption(verbose).addOption(help).addOption(payload);

            CommandLineParser parser = new DefaultParser();
            CommandLine cmd = parser.parse( options, args);

            if(cmd.hasOption("h")) {
                // print the date and time
                HelpFormatter formatter = new HelpFormatter();
                formatter.printHelp("WhiskSim", options);
                return;
            }

            // get p option value
            String payloadFile = cmd.getOptionValue("p");

            if(payloadFile != null) {
                // print default date
                System.out.printf("Payload file: %s\n", payloadFile);

                App app = new App();
                app.readJSON(payloadFile);
            }
            else {
                // print date for country specified by countryCode
                System.err.println("Payload file missing!");
            }

        } catch (Exception e) {
            System.err.println("Unable to create application Options.");
        }

        System.out.println( "-=> Request sent <=-" );
    }

}
