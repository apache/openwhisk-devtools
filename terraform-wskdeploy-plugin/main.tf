resource "example_server" "my-server" {
  address = "1.2.3.4"
  wskdeploy_yaml = "/Users/$USER/$GOPATH/src/github.com/apache/openwhisk-wskdeploy/tests/src/integration/triggerrule/manifest.yml"
}
