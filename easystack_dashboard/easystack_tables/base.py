# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 Nebula, Inc.
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

from django import template
from horizon.tables import base


class EasyStack_DataTableOptions(base.DataTableOptions):
    def __init__(self, options):
        super(EasyStack_DataTableOptions, self).__init__(options)
        self.self_defined_template = None


class EasyStack_DataTableMetaclass(base.DataTableMetaclass):

    def __new__(mcs, name, bases, attrs):
        attrs["_meta"] = EasyStack_DataTableOptions(attrs.get("Meta", None))
        cls = super(
            EasyStack_DataTableMetaclass, mcs).__new__(mcs, name, bases, attrs)
        return cls


class EasyStack_DataTable(base.DataTable):
    def __init__(self, request, data=None, needs_form_wrapper=None, **kwargs):
        super(EasyStack_DataTable, self).__init__(request,
                                                  data=None,
                                                  needs_form_wrapper=None,
                                                  **kwargs)

    def get_self_define_text(self, extra_context=None):
        table_template = template.loader.get_template(
            self._meta.self_defined_template)
        context = template.RequestContext(self.workflow.request, extra_context)
        return table_template.render(context)
