# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 Nebula, Inc.
# Copyright 2013 Big Switch Networks
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

"""
Methods and interface objects used to interact with external APIs.

API method calls return objects that are in many cases objects with
attributes that are direct maps to the data returned from the API http call.
Unfortunately, these objects are also often constructed dynamically, making
it difficult to know what data is available from the API object.  Because of
this, all API calls should wrap their returned object in one defined here,
using only explicitly defined attributes and/or methods.

In other words, Horizon developers not working on openstack_dashboard.api
shouldn't need to understand the finer details of APIs for
Keystone/Nova/Glance/Swift et. al.
"""

from django.conf import settings

from easystack_dashboard.api import base
from easystack_dashboard.api import billing
from easystack_dashboard.api import ceilometer
from easystack_dashboard.api import cinder
from easystack_dashboard.api import fwaas
from easystack_dashboard.api import ganglia
from easystack_dashboard.api import glance
from easystack_dashboard.api import keystone
from easystack_dashboard.api import lbaas
from easystack_dashboard.api import lbaasv2
from easystack_dashboard.api import nagios
from easystack_dashboard.api import network
from easystack_dashboard.api import neutron
from easystack_dashboard.api import nova
from easystack_dashboard.api import vpn
from easystack_dashboard.api import gbp
from easystack_dashboard.api import storage


__all__ = [
    "base",
    "billing",
    "cinder",
    "fwaas",
    "ganglia",
    "glance",
    "keystone",
    "lbaas",
    "lbaasv2",
    "nagios",
    "network",
    "neutron",
    "nova",
    "ceilometer",
    "vpn",
    "signup",
    "lbaasv2",
    'gbp',
    'storage',
]

TICKET_ENABLE = getattr(settings, 'TICKET_ENABLED', False)
if TICKET_ENABLE:
    from easystack_dashboard.api import ticket
    __all__.append("ticket")
