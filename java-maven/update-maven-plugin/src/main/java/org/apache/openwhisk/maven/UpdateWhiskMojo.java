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
package org.apache.openwhisk.maven;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.openwhisk.annotations.Action;
import org.apache.openwhisk.annotations.ActionSequence;
import org.apache.openwhisk.annotations.Package;
import org.apache.openwhisk.annotations.Rule;
import org.apache.openwhisk.annotations.Trigger;
import org.apache.openwhisk.maven.commands.ActionCommand;
import org.apache.openwhisk.maven.commands.ActionSequenceCommand;
import org.apache.openwhisk.maven.commands.PackageCommand;
import org.apache.openwhisk.maven.commands.RuleCommand;
import org.apache.openwhisk.maven.commands.TriggerCommand;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A goal which installs a Java Action into an OpenWhisk instance
 */
@Mojo(name = "update", defaultPhase = LifecyclePhase.INSTALL)
public class UpdateWhiskMojo extends AbstractMojo {

	/**
	 * Specify the whisk API HOST for connecting to OpenWhisk
	 */
	@Parameter(property = "openwhisk.apihost", required = false)
	private String apihost;

	/**
	 * Specify the whisk API VERSION for connecting to OpenWhisk
	 */
	@Parameter(property = "openwhisk.apiversion", required = false)
	private String apiversion;

	/**
	 * Specify the authorization KEY for connecting to OpenWhisk
	 */
	@Parameter(property = "openwhisk.auth", required = false)
	private String auth;

	/**
	 * Specify the client cert for connecting to OpenWhisk
	 */
	@Parameter(property = "openwhisk.cert", required = false)
	private String cert;

	/**
	 * The class directory for finding the main class
	 */
	@Parameter(defaultValue = "${project.build.directory}/classes", required = true, readonly = true)
	private String classesDirectory;

	/**
	 * The executable for OpenWhisk CLI
	 */
	@Parameter(defaultValue = "wsk", property = "openwhisk.cli", required = true)
	private String cli;

	/**
	 * Whether to debug the connection with OpenWhisk
	 */
	@Parameter(defaultValue = "false", property = "openwhisk.debug", required = false)
	private Boolean debug;

	/**
	 * Whether to bypass signature checking for the connection with OpenWhisk
	 */
	@Parameter(defaultValue = "false", property = "openwhisk.insecure", required = false)
	private Boolean insecure;

	/**
	 * The jar file for OpenWhisk to use for creating the functions
	 */
	@Parameter(defaultValue = "target/${project.build.finalName}.jar", property = "openwhisk.jar", required = true)
	private String jar;

	/**
	 * Specify the client key for connecting to OpenWhisk
	 */
	@Parameter(property = "openwhisk.key", required = false)
	private String key;

	/**
	 * Define the logger as a member for easy access
	 */
	private Logger log = LoggerFactory.getLogger(getClass());

	/**
	 * A comma separated list of main classes to load into OpenWhisk
	 */
	@Parameter(defaultValue = "false", required = true)
	private String main;

	public void execute() throws MojoExecutionException {

		final List<String> globalFlags = calculateGlobalFlags();

		List<String> init = new ArrayList<String>();

		if (cli.contains(" ")) {
			for (String c : cli.split(" ")) {
				init.add(c);
			}
		} else {
			init.add(cli);
		}

		for (String mainClass : this.main.split("\\,")) {
			mainClass = mainClass.trim();
			try {
				processAnnotations(mainClass, init, globalFlags);
			} catch (IOException e) {
				throw new MojoExecutionException("IOException occured executing OpenWhisk update", e);
			}
		}
		log.info("OpenWhisk Updates Successful!");

	}

	private List<String> calculateGlobalFlags() {
		List<String> cmd = new ArrayList<String>();
		if (debug) {
			log.debug("Adding debugging flags");
			cmd.add("-v");
			cmd.add("-d");
		}
		if (insecure) {
			log.debug("Adding insecure flags");
			cmd.add("-i");
		}
		if (StringUtils.isNotBlank(apihost)) {
			log.debug("Setting API Host to " + apihost);
			cmd.add("--apihost");
			cmd.add(apihost);
		}
		if (StringUtils.isNotBlank(apiversion)) {
			log.debug("Setting API Version to " + apiversion);
			cmd.add("--apiversion");
			cmd.add(apiversion);
		}
		if (StringUtils.isNotBlank(auth)) {
			log.debug("Setting auth to " + auth);
			cmd.add("--auth");
			cmd.add(auth);
		}
		if (StringUtils.isNotBlank(cert)) {
			log.debug("Setting client cert to " + cert);
			cmd.add("--cert");
			cmd.add(cert);
		}
		if (StringUtils.isNotBlank(key)) {
			log.debug("Setting client key to " + key);
			cmd.add("--key");
			cmd.add(key);
		}
		return cmd;
	}

	private void processAnnotations(String mc, List<String> cmd, List<String> globalFlags)
			throws MojoExecutionException, IOException {
		URLClassLoader cl = null;
		try {
			cl = new URLClassLoader(new URL[] { new File(this.classesDirectory).toURI().toURL() },
					Thread.currentThread().getContextClassLoader());
			Class<?> mainClass = cl.loadClass(mc);
			log.debug("Loaded main class " + mainClass.getCanonicalName());

			Package[] packages = mainClass.getDeclaredAnnotationsByType(Package.class);
			if (packages != null) {
				for (Package pkg : packages) {
					PackageCommand pc = new PackageCommand(pkg, cmd, globalFlags);
					pc.execute();
				}
			}

			Action[] actions = mainClass.getDeclaredAnnotationsByType(Action.class);
			if (actions != null) {
				for (Action action : actions) {
					ActionCommand ac = new ActionCommand(action, cmd, globalFlags, jar, main);
					ac.execute();
				}
			}

			ActionSequence[] actionSequences = mainClass.getDeclaredAnnotationsByType(ActionSequence.class);
			if (actionSequences != null) {
				for (ActionSequence actionSequence : actionSequences) {
					ActionSequenceCommand asc = new ActionSequenceCommand(actionSequence, cmd, globalFlags);
					asc.execute();
				}
			}

			Trigger[] triggers = mainClass.getDeclaredAnnotationsByType(Trigger.class);
			if (triggers != null) {
				for (Trigger trigger : triggers) {
					TriggerCommand tc = new TriggerCommand(trigger, cmd, globalFlags);
					tc.execute();
				}
			}

			Rule[] rules = mainClass.getDeclaredAnnotationsByType(Rule.class);
			if (rules != null) {
				for (Rule rule : rules) {
					RuleCommand rc = new RuleCommand(rule, cmd, globalFlags);
					rc.execute();
				}
			}

		} catch (ClassNotFoundException e) {
			log.error("Unable to find main class: " + main, e);
		} catch (MalformedURLException e) {
			log.error("Malformed URL for class directory: " + classesDirectory, e);
		} finally {
			if (cl != null) {
				try {
					cl.close();
				} catch (IOException e) {
					// Swallow the exception
				}
			}
		}
	}

}
