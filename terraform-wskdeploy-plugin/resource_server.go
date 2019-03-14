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

package main

import (
	"github.com/apache/incubator-openwhisk-wskdeploy/cmd"
    "github.com/apache/incubator-openwhisk-wskdeploy/utils"
	"github.com/hashicorp/terraform/helper/schema"
	"log"
)

func resourceServer() *schema.Resource {
	return &schema.Resource{
		Create: resourceServerCreate,
		Read:   resourceServerRead,
		Update: resourceServerUpdate,
		Delete: resourceServerDelete,

		Schema: map[string]*schema.Schema{
			"address": &schema.Schema{
				Type:     schema.TypeString,
				Required: true,
			},
			"wskdeploy_yaml": &schema.Schema{
				Type:     schema.TypeString,
				Required: true,
			},
		},
	}
}

func resourceServerCreate(d *schema.ResourceData, m interface{}) error {
	_ = d.Get("address").(string)
	yaml := d.Get("wskdeploy_yaml").(string)
	log.Printf("%s", yaml)
    utils.Flags.ManifestPath=yaml
	return cmd.Deploy()
}

func resourceServerRead(d *schema.ResourceData, m interface{}) error {

	_ = d.Get("address").(string)

	return nil
}

func resourceServerUpdate(d *schema.ResourceData, m interface{}) error {

	return nil
}

func resourceServerDelete(d *schema.ResourceData, m interface{}) error {
	d.SetId("")
	return nil
}
