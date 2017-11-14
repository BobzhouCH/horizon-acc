#!/bin/bash

sed -i "s/^LOGIN_OBSERVATION_TIME.*/LOGIN_OBSERVATION_TIME = $1/g" /etc/openstack-dashboard/local_settings

sed -i "s/^LOGIN_LOCK_TIME.*/LOGIN_LOCK_TIME = $2/g" /etc/openstack-dashboard/local_settings

sed -i "s/^LOGIN_LOCK_COUNT.*/LOGIN_LOCK_COUNT = $3/g" /etc/openstack-dashboard/local_settings
