process.stdin.setEncoding('utf8');

if (process.argv[2]=="--help"||process.argv[2]=="-h") {
  help();
} else if (!process.stdin.isTTY) {
  var input = "";
  
  process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      input += chunk;
    }
  });
  
  process.stdin.on('end', () => {
    const params = JSON.parse(input);
    
    run(params);
  });
  
} else {
  let params = {};
  for(var i=3;i<process.argv.length;i++) {
      let [name,value] = process.argv[i].split('=');
      params[name] = value;
  }
  run(params);
}

function help() {
  console.log("");
  console.log("Usage:");
  console.log("  node test.js ./main.js foo=bar");
  console.log("  echo '{\"foo\":\"bar\"}' | node test.js ./main.js");
}

function run(params) {
  const actionToRun = process.argv[2];
  
  if (!actionToRun) {
    console.error("./test.js: Missing argument <action-to-run>");
    help();
    process.exit(1);
  }
  
  const imports = require(actionToRun);
  //support a non-exported main function as a fallback
  const action = imports.main ? imports.main : main;
  
  let result = action(params);
  
  if (result.then) {
    Promise.resolve(result)
      .then(result => console.log(result.toString("utf-8")))
      .catch(error => console.error(error));
  } else {
    console.log(result);
  }
}