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
