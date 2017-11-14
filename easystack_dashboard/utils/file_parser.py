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

import ConfigParser
from django.conf import settings

CONFIG_FILE_URL = getattr(settings,'CONFIG_FILE_URL', None)

def get_config_params(section, key):
    """ To get specific parameters values from
    config file"""
    config = ConfigParser.SafeConfigParser()
    try:
        config.readfp(open(CONFIG_FILE_URL))
        value = config.get(section, key)
        return value
    except Exception:
        return None
