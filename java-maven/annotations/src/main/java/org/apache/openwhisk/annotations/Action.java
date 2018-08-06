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
 * An annotation to indicate that the specified class should register an OpenWhisk action.
 *
 * @see https://github.com/apache/incubator-openwhisk/blob/master/docs/actions.md
 */
@Retention(RUNTIME)
@Target(TYPE)
public @interface Action {

	/**
	 * The annotation values for the action
	 */
	Annotation[] annotations() default {};

	/**
	 * The maximum log size LIMIT in MB for the action (default 10)
	 */
	int logsize() default -1;

	/**
	 * the maximum memory LIMIT in MB for the action (default 256)
	 */
	int memory() default -1;

	/**
	 * The name of the action
	 */
	String name();
	
	/**
	 * The name of the package for this action
	 */
	String packageName() default "";

	/**
	 * The parameter values for the action
	 */
	Parameter[] parameters() default {};

	/**
	 * The timeout LIMIT in milliseconds after which the action is terminated
	 * (default 60000)
	 */
	int timeout() default -1;

	/**
	 * Treat ACTION as a web action, a raw HTTP web action, or as a standard action;
	 * yes | true = web action, raw = raw HTTP web action, no | false = standard
	 * action
	 */
	String web() default "";

	/**
	 * Secure the web action. where SECRET is true, false, or any string. Only valid
	 * when the ACTION is a web action
	 */
	String websecure() default "";
}
