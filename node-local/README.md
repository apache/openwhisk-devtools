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

