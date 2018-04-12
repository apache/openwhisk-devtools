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

import java.util.List;

import org.apache.openwhisk.annotations.Action;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A command for creating an action in OpenWhisk
 */
public class ActionCommand extends Command {

	private final Logger log = LoggerFactory.getLogger(ActionCommand.class);

	public ActionCommand(Action action, List<String> init, List<String> globalFlags, String jar, String main) {
		super(init, action.packageName(), action.name(), globalFlags);
		
		cmd.add(jar);
		cmd.add("--main");
		cmd.add(main);

		this.addAnnotations(action.annotations());
		this.addParameters(action.parameters());

		if (action.logsize() != -1) {
			log.debug("Setting logsize to " + action.logsize());
			cmd.add("--logsize");
			cmd.add(String.valueOf(action.logsize()));
		}
		if (action.memory() != -1) {
			log.debug("Setting memory to " + action.memory());
			cmd.add("--memory");
			cmd.add(String.valueOf(action.memory()));
		}
		if (action.timeout() != -1) {
			log.debug("Setting timeout to " + action.timeout());
			cmd.add("--timeout");
			cmd.add(String.valueOf(action.timeout()));
		}
		if (StringUtils.isNotBlank(action.web())) {
			log.debug("Setting web to " + action.web());
			cmd.add("--web");
			cmd.add(action.web());
		}
		if (StringUtils.isNotBlank(action.websecure())) {
			log.debug("Setting web-secure to " + action.websecure());
			cmd.add("--web-secure");
			cmd.add(action.websecure());
		}
	}

	@Override
	public String getType() {
		return "action";
	}

}
