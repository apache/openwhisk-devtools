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

import org.apache.openwhisk.annotations.ActionSequence;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A command for creating an action sequence in OpenWhisk
 */
public class ActionSequenceCommand extends Command {

	private final Logger log = LoggerFactory.getLogger(ActionSequenceCommand.class);

	public ActionSequenceCommand(ActionSequence actionSequence, List<String> init, List<String> globalFlags) {
		super(init, actionSequence.packageName(), actionSequence.name(), globalFlags);

		this.addAnnotations(actionSequence.annotations());
		this.addParameters(actionSequence.parameters());

		if (actionSequence.logsize() != -1) {
			log.debug("Setting logsize to " + actionSequence.logsize());
			cmd.add("--logsize");
			cmd.add(String.valueOf(actionSequence.logsize()));
		}
		if (actionSequence.memory() != -1) {
			log.debug("Setting memory to " + actionSequence.memory());
			cmd.add("--memory");
			cmd.add(String.valueOf(actionSequence.memory()));
		}
		if (StringUtils.isNotBlank(actionSequence.sequence())) {
			log.debug("Setting sequence to " + actionSequence.sequence());
			cmd.add("--sequence");
			cmd.add(actionSequence.sequence());
		}
		if (actionSequence.timeout() != -1) {
			log.debug("Setting timeout to " + actionSequence.timeout());
			cmd.add("--timeout");
			cmd.add(String.valueOf(actionSequence.timeout()));
		}
		if (StringUtils.isNotBlank(actionSequence.web())) {
			log.debug("Setting web to " + actionSequence.web());
			cmd.add("--web");
			cmd.add(actionSequence.web());
		}
		if (StringUtils.isNotBlank(actionSequence.websecure())) {
			log.debug("Setting web-secure to " + actionSequence.websecure());
			cmd.add("--web-secure");
			cmd.add(actionSequence.websecure());
		}
	}

	@Override
	public String getType() {
		return "action";
	}

}
