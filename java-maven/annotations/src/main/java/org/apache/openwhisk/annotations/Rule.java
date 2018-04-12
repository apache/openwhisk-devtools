/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.openwhisk.annotations;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * An annotation to indicate that the specified class should register an
 * OpenWhisk rule.
 *
 * @see https://github.com/apache/incubator-openwhisk/blob/master/docs/triggers_rules.md
 */
@Retention(RUNTIME)
@Target(TYPE)
public @interface Rule {

	/**
	 * The name of the action to execute for this trigger
	 */
	String actionName();

	/**
	 * The name of the trigger
	 */
	String name();
	
	/**
	 * The name of the package for this rule
	 */
	String packageName() default "";

	/**
	 * The name of the trigger to execute this rule
	 */
	String triggerName();

}
