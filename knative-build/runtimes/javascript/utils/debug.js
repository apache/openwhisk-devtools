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

const FG_RED     = "\x1b[31m";
const FG_GREEN   = "\x1b[32m";
const FG_YELLOW  = "\x1b[33m";
//const FG_BLUE    = "\x1b[34m";
const FG_MAGENTA = "\x1b[35m";
const FG_CYAN    = "\x1b[36m";
const FG_LTGRAY  = "\x1b[37m";
//const FG_WHITE   = "\x1b[97m";

const FG_SUCCESS = FG_GREEN;
const FG_INFO    = FG_LTGRAY;
const FG_WARN    = FG_YELLOW;
const FG_ERROR   = FG_RED;

let config = {
  prefixFGColor: FG_CYAN,
  postfixFGColor: FG_MAGENTA,
  bodyFGColor: FG_INFO,
  defaultFGColor: FG_INFO,
  functionStartMarker: ">>> START: ",
  functionEndMarker: "<<< END: "
};

/**
 * Formats Hours, Minutes, Seconds and Milliseconds as HH:MM:SS:mm
 */
function _getTimeFormatted(){
  let date = new Date();
  let ftime =
      date.getHours() + ":" +
      date.getMinutes() + ":" +
      date.getSeconds() + ":" +
      date.getMilliseconds();
  return ftime;
}

/**
 * Formats and colorizes the prefix of the message consisting of the:
 *   [moduleName] [functionName]()
 *
 * @param color optional (non-default) color for the prefix string
 */
function _formatMessagePrefix(color){

  let prefixColor = config.prefixFGColor;

  // If color arg is defined, use it
  // TODO: validate color is an actual valid color string
  if( color !== undefined) {
    prefixColor = color;
  }

  let prefix = prefixColor + "[" + this.moduleInfo + "]["+this.functionName+"()] ";

  return prefix;

}

/**
 * Formats and colorizes the postfix of the message consisting of the:
 *   [(formattedTime)]
 *
 * @param color optional (non-default) color for the prefix string
 */
function _formatMessagePostfix(color){

  let postfixColor = config.postfixFGColor;

  // If color arg is defined, use it
  // TODO: validate color is an actual valid color string
  if( color !== undefined) {
    postfixColor = color;
  }
  let postfix = postfixColor + " (" + _getTimeFormatted() + ")";
  return postfix;
}

/**
 * Formats and colorizes the body of the message.
 *
 * @param message that comprises the body of the output
 * @param color optional (non-default) color for the prefix string
 */
function _formatBody(message, color){

  let bodyColor = config.bodyFGColor;

  // If color arg is defined, use it
  // TODO: validate color is an actual valid color string
  if(color !== undefined)
    bodyColor = color;

  return bodyColor + message + config.bodyFGColor;
}

/**
 * Formats the entirety of the message comprised of the message prefix + body + postfix.
 *
 * @param message that comprises the body of the formatted output
 * @param label (optional) labels (identifies) code block where message was generated;
 * typically used to identify anon. functions.
 * @param color overrides the default message color (this does not affect prefix or postfix)
 */
function _formatMessage(message, color ){
  // Reset to default color at end of formatted message
  let fmsg =
      _formatMessagePrefix() +
      _formatBody(message, color) +
      _formatMessagePostfix() +
      config.defaultFGColor;
  return fmsg;
}

/**
 * Initialize the debug context including:
 * - Calling module
 * - Calling function (if anonymous, identify by signature)
 *
 * @param callerFunctionLabel (optional) label for the function (or block) to use
 *  instead of pulling from the call stack.  Typically used to identify anon. functions
 *  or blocks
 */
function _updateContext(callerFunctionLabel){

  try{
    let obj = {};

    Error.stackTraceLimit = 2;
    Error.captureStackTrace(obj, _updateContext);

    let fullStackInfo = obj.stack.split(")\n");
    let rawFunctionInfo = fullStackInfo[1];
    let entryInfo = rawFunctionInfo.split("at ")[1];

    // TODO: if there is no '(' separator, we have no function name; do not split
    // e.g., value would look like: /openwhisk-knative-build/runtimes/javascript/src/service.js:180:19
    if( entryInfo.indexOf(" (") !== -1) {
      let fm = entryInfo.split(" (");
      this.functionName = fm[0];
      this.fullModuleInfo = fm[1];
    } else {
      // assume the entry has the full module name and path (function is a anonymous)
      this.functionName = "anonymous";
      this.fullModuleInfo = entryInfo;
    }

    if( typeof this.fullModuleInfo !== "undefined")
      this.moduleInfo =  this.fullModuleInfo.substring( this.fullModuleInfo.lastIndexOf("/") +1);

    // if explicit label provided, use it over one from stack trace...
    if(typeof(callerFunctionLabel) !== 'undefined') {

      if( this.functionName === "anonymous")
        this.functionName = callerFunctionLabel + "." + this.functionName;
      else
        this.functionName = callerFunctionLabel;
    }

  } catch(e){
    console.error("Unable to parse stack trace: " + e.message);
  }

}

module.exports = class DEBUG {

  constructor() {
    // Empty constructor
  }

  /**
   * Used to mark the start of a function block (i.e., via console.info())
   *
   * @param message (optional) message displayed with function start marker
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
  functionStart(message, functionName) {

    _updateContext(functionName);

    let msg = "";
    if(message !== undefined){
      msg = message;
    }

    let formattedMessage = _formatMessage( config.functionStartMarker + msg );
    console.info(formattedMessage);
  };

  /**
   * Used to mark the end of a function block (i.e., console.info())
   *
   * @param message (optional) message displayed with function end marker
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
   functionEnd(message, functionName) {

    _updateContext(functionName);

    let msg = "";
    if(message !== undefined){
      msg = message;
    }

    let formattedMessage = _formatMessage( config.functionEndMarker + msg);
    console.info(formattedMessage);
  };

  /**
   * Used to mark the end of a successful function block (i.e., console.info())
   *
   * @param message (optional) message displayed with function end marker
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
  functionEndSuccess(message, functionName) {

    _updateContext(functionName);

    let msg = "";
    if(message !== undefined){
      msg = message;
    }

    let formattedMessage = _formatMessage( config.functionEndMarker + msg, FG_SUCCESS );
    console.info(formattedMessage);
  };


  /**
   * Used to mark the end function block that has failed, but did not result in
   * an error to the user.  In other words, a soft-failure that was recoverable.
   *
   * @param message (optional) message displayed with function end marker
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
  functionEndFailure(message, functionName) {

    _updateContext(functionName);

    let msg = "";
    if(message !== undefined){
      msg = message;
    }

    let formattedMessage = _formatMessage( config.functionEndMarker + msg, FG_WARN );
    console.info(formattedMessage);
  };

  /**
   * Used to mark the end function block that errored
   *
   * @param message (optional) message displayed with function end marker
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
  functionEndError(message, functionName) {

    _updateContext(functionName);

    let msg = "";
    if(message !== undefined){
      msg = message;
    }

    let formattedMessage = _formatMessage( config.functionEndMarker + msg, FG_ERROR );
    console.info(formattedMessage);
  };

  /**
   * Used to output informational message strings (i.e., console.info())
   *
   * @param msg message to display to console as trace information
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
   trace(message, functionName) {

    _updateContext(functionName);

    let formattedMessage = _formatMessage(message);
    console.info(formattedMessage);
  };

  /**
   * Used to output the type and contents of Javascript types and Objects
   * This method attempts to display Objects as JSON strings where cyclical references
   * do not occur; otherwise, it attempts to display a 1st level (shallow) contents
   * of the Object.
   *
   * @param obj Javascript Object (or type) to dump its information to console.info()
   * @param label optional string label to display with object dump
   * @param functionName (optional) name of the function; typically used to better
   * identify anon. functions.
   */
   dumpObject(obj, label, functionName){

    _updateContext(functionName);

    let otype = typeof(obj);

    if( otype !== "undefined") {

      try{
        let jsonFormatted = JSON.stringify(obj,null,4);
        let formattedMessage = _formatMessage("[" + label + " (" + otype + ")] = "+ jsonFormatted);
        console.info(formattedMessage);
      } catch (e) {

        // try manually dumping a shallow (string-friendly) copy of the Object
        try {
          console.log("{");
          Object.keys(obj).forEach(
              function (key) {
                if(typeof obj[key] === 'string' && typeof(obj[key].toString()) !== "undefined"){
                  console.info("    \"" + key + "\": \"" + obj[key].toString() +"\"" );
                }
              }
          );
          console.log("}");

        } catch(e2) {
          console.error("[" + label + " (" + otype + ")] : " + e2.message);
          let formattedMessage = _formatMessage(_ + "[" + label + " (" + otype + ")] : " +
              e2.message);
          console.error(formattedMessage);
        }
      }

    } else {
      let formattedMessage = _formatMessage( FG_YELLOW + "[" + label + " (" + otype + ")] is undefined." + FG_LTGRAY);
      console.info(formattedMessage);
    }

  }

  /**
   * Inject an error into code with additional information around it.
   *
   * @param label Javascript Object (or type) to dump its information to console.info()
   */
  throw(label) {

    _updateContext(label);

    // intentionally throw an error and be clear to log this fact
    let formattedMessage = _formatMessage(FG_RED + "[" + label + "] Intentionally throwing error." + FG_LTGRAY);
    throw Error(formattedMessage);
  }

};
