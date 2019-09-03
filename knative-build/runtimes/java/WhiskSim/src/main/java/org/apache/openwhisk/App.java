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
import java.nio.file.Path;
import java.nio.file.Paths;
import org.apache.commons.cli.*;

/**
 * WhiskSim
 */
public class App
{
   /**
    * Open and reads a text file containing a list of "test" (subdirectories) to init/run
    */
    private List<String> readTestFile(String filename)
    {
        System.out.println("readTestFile():" + filename );
        List<String> records = new ArrayList<String>();
        try
        {
            BufferedReader reader = new BufferedReader(new FileReader(filename));
            String line;
            while ((line = reader.readLine()) != null)
            {
                System.out.println("readTestFile(): line=[" + line + "]" );
                records.add(line);
            }
            reader.close();
            return records;
        }
        catch (Exception e)
        {
            System.err.format("Unable to read test file '%s'.", filename);
            e.printStackTrace();
            return null;
        }
    }

    public static void main( String[] args )
    {
        // create Options object
        Options options = new Options();

        // add verbose option
        Option help = new Option( "h", "help", false, "print utility help" );
        Option verbose = new Option( "v", "verbose", false, "enable verbose output" );
        options.addOption(verbose).addOption(help);

        HelpFormatter formatter = new HelpFormatter();
        formatter.printHelp("WhiskSim", options);

        // Option testFile   = OptionBuilder.withArgName( "file" )
        //                         .hasArg()
        //                         .withDescription(  "use given file for test input" )
        //                         .create( "testFile" );
        // options.addOption(testFile);

        if(args.length > 0)
        {
            System.out.println("main(String[] args):");
            for (String s : args)
            {
                System.out.println(s);
            }

            App app = new App();

            Path p = Paths.get(args[0]);
            String file = p.getFileName().toString();

            List testList = app.readTestFile(args[0]);
        }
        else
        {
            System.out.println("No arguments passed to main().");
        }

        System.out.println( "Hello World!" );
    }

}
