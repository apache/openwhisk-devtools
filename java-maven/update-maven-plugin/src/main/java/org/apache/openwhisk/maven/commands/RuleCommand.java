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

import org.apache.openwhisk.annotations.Rule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A command for creating a rule in OpenWhisk
 */
public class RuleCommand extends Command {

	private final Logger log = LoggerFactory.getLogger(RuleCommand.class);

	public RuleCommand(Rule rule, List<String> init, List<String> globalFlags) {
		super(init, rule.name(), globalFlags);

		log.debug("Setting trigger name to {}", rule.triggerName());
		cmd.add(rule.triggerName());

		log.debug("Setting trigger name to {}", rule.actionName());
		cmd.add(rule.actionName());
	}

	@Override
	public String getType() {
		return "rule";
	}

}
