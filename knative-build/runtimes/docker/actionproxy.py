"""Executable Python script for a proxy service to dockerSkeleton.

Provides a proxy service (using Flask, a Python web microframework)
that implements the required /init and /run routes to interact with
the OpenWhisk invoker service.

The implementation of these routes is encapsulated in a class named
ActionRunner which provides a basic framework for receiving code
from an invoker, preparing it for execution, and then running the
code when required.

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
"""

import base64
import codecs
import io
import json
import os
import subprocess
import sys
import zipfile


import flask
from gevent.pywsgi import WSGIServer

# TODO REMOVE FOLLOWING LINE
sys.path.append('/Users/pwp/src/openwhisk-devtools/knative-build/runtimes/docker')
#from platform import PlatformFactory, InvalidPlatformError
from owplatform import PlatformFactory, InvalidPlatformError
from owplatform.openwhisk import OpenWhiskImpl

PLATFORM_OPENWHISK = 'openwhisk'
DEFAULT_PLATFORM = PLATFORM_OPENWHISK

class ActionRunner:
    """ActionRunner."""
    LOG_SENTINEL = 'XXX_THE_END_OF_A_WHISK_ACTIVATION_XXX'

    # initializes the runner
    # @param source the path where the source code will be located (if any)
    # @param binary the path where the binary will be located (may be the
    # same as source code path)
    def __init__(self, source=None, binary=None, zipdest=None):
        # TODO RESTORE
        #defaultBinary = '/action/exec'
        defaultBinary = 'action/exec'
        self.source = source if source else defaultBinary
        self.binary = binary if binary else defaultBinary
        self.zipdest = zipdest if zipdest else os.path.dirname(self.source)
        os.chdir(os.path.dirname(self.source))

    def preinit(self):
        return

    # extracts from the JSON object message a 'code' property and
    # writes it to the <source> path. The source code may have an
    # an optional <epilogue>. The source code is subsequently built
    # to produce the <binary> that is executed during <run>.
    # @param message is a JSON object, should contain 'code'
    # @return True iff binary exists and is executable
    def init(self, message):
        def prep():
            self.preinit()
            if 'code' in message and message['code'] is not None:
                binary = message['binary'] if 'binary' in message else False
                if not binary:
                    return self.initCodeFromString(message)
                else:
                    return self.initCodeFromZip(message)
            else:
                return False

        if prep():
            try:
                # write source epilogue if any
                # the message is passed along as it may contain other
                # fields relevant to a specific container.
                if self.epilogue(message) is False:
                    return False
                # build the source
                if self.build(message) is False:
                    return False
            except Exception:
                return False
        # verify the binary exists and is executable
        return self.verify()

    # optionally appends source to the loaded code during <init>
    def epilogue(self, init_arguments):
        return

    # optionally builds the source code loaded during <init> into an executable
    def build(self, init_arguments):
        return

    # @return True iff binary exists and is executable, False otherwise
    def verify(self):
        return (os.path.isfile(self.binary) and
                os.access(self.binary, os.X_OK))

    # constructs an environment for the action to run in
    # @param message is a JSON object received from invoker (should
    # contain 'value' and 'api_key' and other metadata)
    # @return an environment dictionary for the action process
    def env(self, message):
        # make sure to include all the env vars passed in by the invoker
        env = os.environ
        for k, v in message.items():
            if k != 'value':
                env['__OW_%s' % k.upper()] = v
        return env

    # runs the action, called iff self.verify() is True.
    # @param args is a JSON object representing the input to the action
    # @param env is the environment for the action to run in (defined edge
    # host, auth key)
    # return JSON object result of running the action or an error dictionary
    # if action failed
    def run(self, args, env):
        def error(msg):
            # fall through (exception and else case are handled the same way)
            sys.stdout.write('%s\n' % msg)
            return (502, {'error': 'The action did not return a dictionary.'})

        try:
            input = json.dumps(args)
            if len(input) > 131071:             # MAX_ARG_STRLEN (131071) linux/binfmts.h
                # pass argument via stdin
                p = subprocess.Popen(
                    [self.binary],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env)
            else:
                # pass argument via stdin and command parameter
                p = subprocess.Popen(
                    [self.binary, input],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=env)
            # run the process and wait until it completes.
            # stdout/stderr will always be set because we passed PIPEs to Popen
            (o, e) = p.communicate(input=input.encode())

        except Exception as e:
            return error(e)

        # stdout/stderr may be either text or bytes, depending on Python
        # version, so if bytes, decode to text. Note that in Python 2
        # a string will match both types; so also skip decoding in that case
        if isinstance(o, bytes) and not isinstance(o, str):
            o = o.decode('utf-8')
        if isinstance(e, bytes) and not isinstance(e, str):
            e = e.decode('utf-8')

        # get the last line of stdout, even if empty
        lastNewLine = o.rfind('\n', 0, len(o)-1)
        if lastNewLine != -1:
            # this is the result string to JSON parse
            lastLine = o[lastNewLine+1:].strip()
            # emit the rest as logs to stdout (including last new line)
            sys.stdout.write(o[:lastNewLine+1])
        else:
            # either o is empty or it is the result string
            lastLine = o.strip()

        if e:
            sys.stderr.write(e)

        try:
            json_output = json.loads(lastLine)
            if isinstance(json_output, dict):
                return (200, json_output)
            else:
                return error(lastLine)
        except Exception:
            return error(lastLine)

    # initialize code from inlined string
    def initCodeFromString(self, message):
        with codecs.open(self.source, 'w', 'utf-8') as fp:
            fp.write(message['code'])
        return True

    # initialize code from base64 encoded archive
    def initCodeFromZip(self, message):
        try:
            bytes = base64.b64decode(message['code'])
            bytes = io.BytesIO(bytes)
            archive = zipfile.ZipFile(bytes)
            archive.extractall(self.zipdest)
            archive.close()
            return True
        except Exception as e:
            print('err', str(e))
            return False

proxy = flask.Flask(__name__)
proxy.debug = False
# disable re-initialization of the executable unless explicitly allowed via an environment
# variable PROXY_ALLOW_REINIT == "1" (this is generally useful for local testing and development)
proxy.rejectReinit = 'PROXY_ALLOW_REINIT' not in os.environ or os.environ['PROXY_ALLOW_REINIT'] != "1"
proxy.initialized = False
runner = None

def setRunner(r):
    global runner
    runner = r


def init():
    if proxy.rejectReinit is True and proxy.initialized is True:
        msg = 'Cannot initialize the action more than once.'
        sys.stderr.write(msg + '\n')
        response = flask.jsonify({'error': msg})
        response.status_code = 403
        return response

    message = flask.request.get_json(force=True, silent=True)
    if message and not isinstance(message, dict):
        flask.abort(404)
    else:
        value = message.get('value', {}) if message else {}

    if not isinstance(value, dict):
        flask.abort(404)

    try:
        status = runner.init(value)
    except Exception as e:
        status = False

    if status is True:
        proxy.initialized = True
        return ('OK', 200)
    else:
        response = flask.jsonify({'error': 'The action failed to generate or locate a binary. See logs for details.'})
        response.status_code = 502
        return complete(response)


def run():
    def error():
        response = flask.jsonify({'error': 'The action did not receive a dictionary as an argument.'})
        response.status_code = 404
        return complete(response)

    message = flask.request.get_json(force=True, silent=True)
    if message and not isinstance(message, dict):
        return error()
    else:
        args = message.get('value', {}) if message else {}
        if not isinstance(args, dict):
            return error()

    if runner.verify():
        try:
            code, result = runner.run(args, runner.env(message or {}))
            response = flask.jsonify(result)
            response.status_code = code
        except Exception as e:
            response = flask.jsonify({'error': 'Internal error. {}'.format(e)})
            response.status_code = 500
    else:
        response = flask.jsonify({'error': 'The action failed to locate a binary. See logs for details.'})
        response.status_code = 502
    return complete(response)


def complete(response):
    # Add sentinel to stdout/stderr
    sys.stdout.write('%s\n' % ActionRunner.LOG_SENTINEL)
    sys.stdout.flush()
    sys.stderr.write('%s\n' % ActionRunner.LOG_SENTINEL)
    sys.stderr.flush()
    return response


def main():
    platformImpl = None
    PlatformFactory.addPlatform(PLATFORM_OPENWHISK, OpenWhiskImpl)
    targetPlatform = os.getenv('__OW_RUNTIME_PLATFORM', DEFAULT_PLATFORM)

    if not PlatformFactory.isSupportedPlatform(targetPlatform):
        raise InvalidPlatformError(targetPlatform, PlatformFactory.supportedPlatforms())
    else:
        platformFactory = PlatformFactory()
        platformImpl = platformFactory.createPlatformImpl(targetPlatform)

    platformImpl.registerHandlers(proxy, init, run)    
    port = int(os.getenv('FLASK_PROXY_PORT', 8080))
    server = WSGIServer(('0.0.0.0', port), proxy, log=None)
    server.serve_forever()

if __name__ == '__main__':
    setRunner(ActionRunner())
    main()

