// Licensed to the Apache Software Foundation (ASF) under one or more contributor
// license agreements; and to You under the Apache License, Version 2.0.

process.stdin.setEncoding('utf8');

var args = process.argv;
args.shift();
args.shift();

//collect parameters
var params = {};
//output JSON
var json = false;

var action;

//parse all parameters
while(arg = args.shift()) {
  if (arg=="--help"||arg=="-h") {
    help();
    process.exit();
  } else if (arg=="--json"||arg=="-j") {
    json = true;
  } else if (process.stdin.isTTY&&arg.indexOf("=")>1) {
    let [name,value] = arg.split('=');
    params[name] = value;
  } else {
    action = arg;
  }
}

//if no stdin, run with command line params
if (process.stdin.isTTY) {
  run(action, params, json);
} else {
  //if stdin, read input and parse as JSON
  var input = "";

  process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      input += chunk;
    }
  });

  process.stdin.on('end', () => {
    const params = JSON.parse(input);

    run(action, params, json);
  });
}

function help() {
  console.log("");
  console.log("Usage:");
  console.log("  node test.js ./main.js foo=bar");
  console.log("  echo '{\"foo\":\"bar\"}' | node test.js ./main.js");
  console.log("");
  console.log("Optional parameters");
  console.log("  --help   -h   print this help");
  console.log("  --json   -j   format result as JSON")
  process.exit();
}

function fallback(action) {
  eval(require("fs").readFileSync(action, "utf-8"));
  if (this.main) {
    return main;
  } else {
    console.error(action + " has no function main or no exports.main");
    process.exit(1);
  }
}

function run(action, params, outputJSON) {
  if (!action) {
    console.error("./test.js: Missing argument <action-to-run>");
    help();
    process.exit(1);
  }

  const imports = require(action);

  //support a non-exported main function as a fallback
  const mainfunct = imports.main ? imports.main : fallback(action);

  let result = mainfunct(params);
  if (result.then) {
    Promise.resolve(result)
      .then(result => console.log(outputJSON ? JSON.stringify(result) : result))
      .catch(error => console.error(error));
  } else {
    console.log(outputJSON ? JSON.stringify(result) : result);
  }
}

//allow ctrl-c to exit...
process.on('SIGINT', function() {
  console.log("exiting...");
  process.exit();
});
