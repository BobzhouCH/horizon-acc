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
import json

from django.utils import encoding
from django.utils import functional

from horizon.tables import actions
from horizon.tables import base as tablebase
from horizon.tables import views

from easystack_dashboard.api import base as apibase


class OSAPIJSONEncoder(views.TableEncoder):
    """This class will handle serialization of some of the
    non conventional classes encountered in Openstack API results.
    """
    def default(self, obj):

        # Serialize API resource objects
        if isinstance(obj, apibase.APIResourceWrapper):
            dict_data = dict((attr, getattr(obj, attr))
                            for attr in obj._attrs
                            if hasattr(obj, attr))
            return dict_data
        elif isinstance(obj, apibase.APIDictWrapper):
            return obj._apidict

        # Serialize columns and actions
        # Forward to view for handling
        elif isinstance(obj, tablebase.Column):
            return self.get_column_json(obj)
        elif isinstance(obj, actions.BaseAction):
            return self.get_action_json(obj)

        # This section covers lazy loaded strings like u"-"
        elif isinstance(obj, functional.Promise):
            return encoding.force_text(obj)

        # There are collection of classes like glance
        # which need to be serialized in another way
        else:
            try:
                return json.JSONEncoder.default(self, obj)
            except Exception:
                return obj.to_dict()
