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

from django import forms
from django import template
from django.template.defaultfilters import linebreaks  # noqa
from django.template.defaultfilters import safe  # noqa
from django.utils.encoding import force_unicode  # noqa

from horizon.workflows import base


class EasyStack_ActionMetaclass(base.ActionMetaclass):
    def __new__(mcs, name, bases, attrs):
        opts = attrs.pop("Meta", None)
        cls = super(
            EasyStack_ActionMetaclass, mcs).__new__(mcs, name, bases, attrs)
        # add self defined template in mata
        cls.self_defined_template = getattr(
            opts, "self_defined_template", None)
        return cls


class EasyStack_Action(base.Action):
    """Add self defined template to render"""
    __metaclass__ = EasyStack_ActionMetaclass

    def __init__(self, request, context, *args, **kwargs):
        super(EasyStack_Action, self).__init__(request,
                                               context,
                                               *args,
                                               **kwargs)

    def get_self_define_text(self, extra_context=None):
        """ Returns the text for this action. """
        text = ""
        extra_context = extra_context or {}
        if self.self_defined_template:
            #Render self_defined template
            tmpl = template.loader.get_template(self.self_defined_template)
            context = template.RequestContext(self.request, extra_context)
            text += tmpl.render(context)
        return safe(text)


class EasyStack_Step(base.Step):

    def __init__(self, workflow):
        super(EasyStack_Step, self).__init__(workflow)

    def get_self_define_text(self):
        """ Returns the help text for this step. """
        text = ""
        text += self.action.get_self_define_text()
        return safe(text)
