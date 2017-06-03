# Testing node.js functions locally

Usage:

```bash
node test.js ./path-to-function.js parameter=value parameter2=value2
```

Will invoke the `main` function of `path-to-function.js` with following `params`:
```javascript
{
  "parameter":"value",
  "parameter2":"value"
}
```

Alternatively, input can be passed on stdin, this allows the creation of more complex input
objects that would be inconvenient to edit on the command line or passing non-string values.

```bash
echo '{"boolean": true}' | node test.js ./path-to-function.js
cat input.json | node test.js ./path-to-function.js
```

If you intend to post-process the result, for instance with `jq`, add the parameter `--json`,
which will make sure `test.js` returns well-formed JSON. The default is off, which means you
will get a slightly more readable output.

## using npm libraries

If your action uses npm libraries, you may have trouble running it locally without creating a special environment just for it to run.

In this case you can run the docker image that open whisk uses to launch your action, along with its preinstalled libraries:

```bash
./runtest.sh --debug --action ./path-to-function.js --param name=value --param othername=othervalue
```

Usage:
* --debug : enable request debugging (by adding NODE_DEBUG=request)
* --action : action js file you are trying to test 
* --param : parameter to pass to main (multiple allowed)
* --image : the action image used to run node (default is openwhisk/nodejs6action:latest)
