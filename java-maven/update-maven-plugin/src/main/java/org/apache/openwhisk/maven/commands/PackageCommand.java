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

import org.apache.openwhisk.annotations.Package;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A command for creating a package in OpenWhisk
 */
public class PackageCommand extends Command {

	private final Logger log = LoggerFactory.getLogger(PackageCommand.class);

	public PackageCommand(Package pkg, List<String> init, List<String> globalFlags) {
		super(init, pkg.name(), globalFlags);

		this.addAnnotations(pkg.annotations());
		this.addParameters(pkg.parameters());

		if (!StringUtils.isBlank(pkg.shared())) {
			log.debug("Setting shared to {}", pkg.shared());
			cmd.add("--shared");
			cmd.add(pkg.shared());
		}
	}

	@Override
	public String getType() {
		return "package";
	}

}
