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
package org.apache.openwhisk.runtime.java.action;

import java.util.Map;

public class Debug {

    public static final String FG_RED = (char)27 + "[31m";
    public static final String  FG_GREEN   = (char)27 + "[32m";
    public static final String  FG_YELLOW  = (char)27 + "[33m";
    //public static final String  FG_BLUE    = (char)27 + "[34m";
    public static final String  FG_MAGENTA = (char)27 + "[35m";
    public static final String  FG_CYAN    = (char)27 + "[36m";
    public static final String  FG_LIGHT_GRAY  = (char)27 + "[37m";
    //public static final String  FG_WHITE   = (char)27 + "[97m";

    public static final String  FG_SUCCESS = FG_GREEN;
    public static final String  FG_INFO    = FG_LIGHT_GRAY;
    public static final String  FG_WARN    = FG_YELLOW;
    public static final String  FG_ERROR   = FG_RED;

    public static final String prefixFGColor = FG_CYAN;
    public static final String postfixFGColor = FG_MAGENTA;
    public static final String bodyFGColor = FG_INFO;
    public static final String defaultFGColor = FG_INFO;
    public static final String functionStartMarker = ">>> START: ";
    public static final String functionEndMarker = "<<< END: ";

    // int, rounding is OK
    public static final int NANO = 1000000;

    // CONTEXT
    private static String PACKAGE_PATH = "org.apache.openwhisk.runtime.java.action";
    private static int PACKAGE_PATH_LENGTH = PACKAGE_PATH.length()+1;
    private static String FQ_METHOD = "";
    private static String METHOD = "";
    private static long currentTime = 0;

    private static long updateContext(){
        currentTime = System.nanoTime();
        StackTraceElement[] stackTraceElements = Thread.currentThread().getStackTrace();
        FQ_METHOD = stackTraceElements[4].toString();
        METHOD = FQ_METHOD.substring(PACKAGE_PATH_LENGTH);
        return currentTime;
    }

    private static String formatMessage(String prefix, String message, long startTime){
        StringBuilder sb = new StringBuilder();
        sb.append(prefixFGColor);
        sb.append(prefix);
        sb.append("[");
        sb.append(METHOD);
        sb.append("] ");
        sb.append(bodyFGColor);
        sb.append(message);
        sb.append(postfixFGColor);

        // append method elapsed time
        sb.append("time (");
        sb.append((currentTime)/NANO);
        sb.append(" msec)");

        if(startTime >= 0){
            sb.append(" elapsed (");
            sb.append((currentTime-startTime)/NANO);
            sb.append(" msec)");
        }

        sb.append(defaultFGColor);
        return sb.toString();
    }

    public static long start() { return start("");}

    public static long start(String msg) {
        currentTime = updateContext();
        String formattedMsg = formatMessage(functionStartMarker, msg, -1);
        System.out.println(formattedMsg);
        return currentTime;
    }

    public static long end() { return end("",-1);}
    public static long end(long startTime) { return end("", startTime);}

    public static long end(String msg, long startTime) {
        currentTime = updateContext();
        String formattedMsg = formatMessage(functionEndMarker, msg, startTime);
        System.out.println(formattedMsg);
        return currentTime;
    }

    public static void printEnv() {
        Map<String, String> envVars = System.getenv();
        long ts = System.nanoTime();
        System.out.printf("%sEnvironment Variables (%d):%s\n", prefixFGColor, ts, bodyFGColor);
        for (String key : envVars.keySet()) {
            System.out.printf(">> %s=\"%s\"%n", key, envVars.get(key));
        }
    }

}
