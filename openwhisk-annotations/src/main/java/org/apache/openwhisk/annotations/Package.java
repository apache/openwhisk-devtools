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
 * OpenWhisk package.
 * 
 * By convention, this will usually be registered on a package_info class in the
 * package containing the actions, feeds and triggers for a particular package.
 *
 * @see https://github.com/apache/incubator-openwhisk/blob/master/docs/packages.md
 */
@Retention(RUNTIME)
@Target(TYPE)
public @interface Package {

	/**
	 * The annotation values for the trigger
	 */
	Annotation[] annotations() default {};

	/**
	 * The name of the trigger
	 */
	String name();

	/**
	 * The parameter values for the trigger
	 */
	Parameter[] parameters() default {};

	/**
	 * The scope for this package, should be one of "yes" or "no"
	 */
	String shared() default "";

}
