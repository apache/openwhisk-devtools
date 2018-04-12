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
package org.apache.openwhisk.maven.commands;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.apache.maven.plugin.MojoExecutionException;
import org.apache.openwhisk.annotations.Annotation;
import org.apache.openwhisk.annotations.Parameter;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An abstract OpenWhisk command, base class for the specific types to extend.
 */
public abstract class Command {

	private static final Logger log = LoggerFactory.getLogger(Command.class);

	protected final List<String> cmd = new ArrayList<String>();

	private List<String> globalFlags = null;

	private String name;

	public Command(List<String> init, String pkg, String name, List<String> globalFlags) {
		log.debug("Creating command for {}/{}", pkg, name);
		this.cmd.addAll(init);
		this.cmd.add(getType());
		this.cmd.add("update");
		if (StringUtils.isNotBlank(pkg)) {
			this.cmd.add(pkg + "/" + name);
		} else {
			this.cmd.add(name);
		}
		this.globalFlags = globalFlags;
	}

	protected void addAnnotations(Annotation[] annotations) {
		if (annotations != null) {
			for (Annotation a : annotations) {
				cmd.add("-a");
				cmd.add(a.key());
				cmd.add(a.value());
			}
		}
	}

	protected void addParameters(Parameter[] parameters) {
		if (parameters != null) {
			for (Parameter p : parameters) {
				cmd.add("-p");
				cmd.add(p.key());
				cmd.add(p.value());
			}
		}
	}

	public void execute() throws IOException, MojoExecutionException {

		log.info("Updating OpenWhisk {} {}", getType(), getName());

		cmd.addAll(globalFlags);

		log.debug("Executing OpenWhisk CLI Command with command: {}", cmd);
		ProcessBuilder builder = new ProcessBuilder();
		builder.command(cmd);
		Process pr = builder.start();

		readInput(pr.getInputStream(), false);
		if (readInput(pr.getErrorStream(), true)) {
			throw new MojoExecutionException("Call to OpenWhisk failed!");
		} else {
			log.info("OpenWhisk Function Updated!");
		}

	}

	public String getName() {
		return name;
	}

	public abstract String getType();

	private boolean readInput(InputStream is, boolean err) {
		boolean read = false;
		BufferedReader input = new BufferedReader(new InputStreamReader(is));
		String line = null;
		try {
			while ((line = input.readLine()) != null) {
				if (err) {
					log.error(line);
				} else {
					log.info(line);
				}
				read = true;
			}
		} catch (IOException e) {
			log.error("Exception reading response from OpenWhisk CLI Command", e);
		}
		return read;
	}

	public void setName(String name) {
		this.name = name;
	}
}
