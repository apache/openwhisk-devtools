Developer tools for OpenWhisk
=============================


### Installing OpenWhisk

* Using Docker-Compose. See the [README](docker-compose/README.md) for more details. 
 
  [![Build Status](https://travis-ci.org/openwhisk/openwhisk-devtools.svg?branch=docker-compose)](https://travis-ci.org/openwhisk/openwhisk-devtools)
  
  ```bash
  cd docker-compose
  make quick-start
  ```
  

### Travis builds

Each tool in this repository has to provide travis build scripts inside a `.travis` folder. 
The folder should define 2 scripts:
* `setup.sh` - invoked during `before_install` phase 
* `build.sh` - invokes during `script` phase 

For an example check out [docker-compose/.travis](docker-compose/.travis) folder.
