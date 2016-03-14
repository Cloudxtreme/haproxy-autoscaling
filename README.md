# HAProxy autoscaling

This small tool works with HAProxy and AWS EC2. The objective is to generate HAProxy conf file with all privates IP instances with a specific `tag:Application`

## How to use

1. Set `Application` tag for instances you want to serve behind HAProxy

1. Set an HAProxy server

1. Install node and `npm i -g haproxy-autoscaling`

1. Set a CRON task with `update-haproxy` to generate HAProxy conf with all instances

## TODO

1. Avoid to restart server if no diff on generate configuration

1. Provide a CRON task sample file
