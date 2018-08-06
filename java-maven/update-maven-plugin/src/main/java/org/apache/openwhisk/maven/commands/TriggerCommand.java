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

import org.apache.openwhisk.annotations.Trigger;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A command for creating a trigger in OpenWhisk
 */
public class TriggerCommand extends Command {

	private final Logger log = LoggerFactory.getLogger(RuleCommand.class);

	public TriggerCommand(String namespace, Trigger trigger, List<String> init, List<String> globalFlags) {
		super(init, namespace, trigger.name(), globalFlags);

		this.addAnnotations(trigger.annotations());
		this.addParameters(trigger.parameters());
		if (StringUtils.isBlank(trigger.feed())) {
			log.debug("Setting feed to {}", trigger.feed());
			cmd.add("--feed");
			cmd.add(trigger.feed());
		}
	}

	@Override
	public String getType() {
		return "trigger";
	}

}
