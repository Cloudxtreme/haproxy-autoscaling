#!/usr/bin/env node

// Dependencies
var program = require('commander');
var pkg = require('../package.json');
var AWS = require('aws-sdk');
var _ = require('lodash');
var fs = require('fs');

/**
 * Get private ip address from describeInstances response (reservations)
 *
 * @param {Object} reservations
 * @return {[String]} list of private ip
 */
function getPrivateIpAddress (reservations) {
  return _(reservations)
  .map(_.partial(_.get, _, "Instances"))
  .flatten()
  .map("PrivateIpAddress")
  .value()
}

program
  .version(pkg.version)
  .option('--region <region>', 'ec2 instances region')
  .option('--output <path>', 'Defaults to haproxy.cfg if not specified')
  .option('--template <path>', 'haproxy.cfg template')
  .option('--application <tag>', 'filter on `Application` tag to find correct instances group')
  .parse(process.argv);

// Find ec2 instances with match `tag:Application`
var ec2Options = {};
if (program.region) _.set( ec2Options, "region", program.region);

var describeOptions = {};
if (program.application) {
  _.set(describeOptions, "Filters.0.Name", "tag:Application");
  _.set(describeOptions, "Filters.0.Values", [program.application]);
}

new AWS.EC2(ec2Options).describeInstances(describeOptions, function(err, data){
  if (err) console.log(err);

  // Write configuration file
  var serversIps = getPrivateIpAddress(data.Reservations);
  var file = fs.readFileSync(program.template).toString();

  _.forEach(serversIps, function(serverIp, n){
    file += "server " + program.application + "-" + (n + 1) + " "+ serverIp + ":1337 maxconn 1000 weight 1 cookie websrv" + (n + 1) + " check inter 10000 fall 3 rise 1\n";
  });

  fs.writeFileSync(program.output, file);
  console.log(program.output + " is up to date!");
});
