# Copyright 2016 Lenovo, Inc.
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

from __future__ import absolute_import

import logging

LOG = logging.getLogger(__name__)


def can_access_dashboard(context, dash):
    can_access = False

    if callable(dash.nav):
        can_nav = dash.nav(context)
    else:
        can_nav = dash.nav

    if can_nav and dash.can_access(context):
        can_access = True

    return can_access


def can_access_panel(context, panel):
    can_access = False

    if callable(panel.nav):
        can_nav = panel.nav(context)
    else:
        can_nav = panel.nav

    if can_nav and panel.can_access(context):
        can_access = True

    return can_access


def is_admin_panel(context, dash, panel):
    if dash.slug in ('admin', 'identity'):
        return True

    if getattr(panel, 'admin_nav', False):
        return True

    return False
