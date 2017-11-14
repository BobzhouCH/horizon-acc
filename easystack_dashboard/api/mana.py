# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright (c) 2015 X.commerce, a business unit of Easystack Inc.
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

import logging
import time

from django.conf import settings

from manaclient import client as mana_client
from manaclient import utils as mana_utils

LOG = logging.getLogger(__name__)


def manaclient(request):
    url = getattr(settings, 'MANA_URL', None)
    client = mana_client.Client(url)
    return client


class ManaManager(object):

    def __init__(self, request, domain=None):
        self.request = request
        self.domain = domain
        self.client = manaclient(request)
        if self.domain is None:
            from easystack_dashboard.api import keystone
            self.domain = keystone.get_default_domain(request)

    @property
    def context(self):
        context = {
            'user_info': {
                'domain_id': self.domain.id,
                'token': self.request.user.token.id,
            }
        }
        return context

    def get_available_resource(self, res_type=None, res_sub_type=None):
        response = self.client.get_available_resource(self.context,
                                                      res_type=res_type, res_sub_type=res_sub_type)
        return response

    def get_dedicated_resource(self, res_type=None, res_sub_type=None):
        response = self.client.get_dedicated_resource(self.context,
                                                      res_type=res_type, res_sub_type=res_sub_type)
        return response

    def change_dedicated_resource(self, change_set):
        response = self.client.change_dedicated_resource(self.context,
                                                         change_set)
        if response['status'] not in ['ok', 'pending']:
            raise mana_utils.ManaClientException(status=500,
                                                 content=response['error'])
        return response

    def add_resources(self, ress):
        change_set = mana_utils.ChangeSet()
        # a tree like this: {compute:[...], network: [...], ...}
        if isinstance(ress, dict):
            flatten = []
            for res_type, typed_ress in ress.iteritems():
                for res in typed_ress:
                    res['res_type'] = res.get('res_type') or res_type
                    flatten.append(res)
            ress = flatten
        # a flatten list
        for res in ress:
            change_set.add(res['res_type'], res['res_sub_type'], res['num'])
        return self.change_dedicated_resource(change_set)

    def add_compute_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.add('compute', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def add_network_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.add('network', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def add_storage_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.add('storage', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def remove_compute_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.remove('compute', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def remove_network_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.remove('network', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def remove_storage_resource(self, res_sub_type, num):
        change_set = mana_utils.ChangeSet()
        change_set.remove('storage', res_sub_type, num)
        return self.change_dedicated_resource(change_set)

    def cleanup_resource(self, res_type=None):
        change_set = mana_utils.ChangeSet()
        if res_type is None:
            res_types = ['compute', 'network', 'storage']
        else:
            res_types = [res_type]
        for res_type in res_types:
            change_set.cleanup(res_type)
        return self.change_dedicated_resource(change_set)

    def transaction_state(self, transaction_id):
        return self.client.get_request_transaction(self.context,
                                                   transaction_id)

    def wait_for_transaction(self, transaction_id):
        def _get_trans_state():
            response = self.transaction_state(transaction_id)
            if response['status'] != 'ok':
                msg = 'failed to get transaction: %s(%s)' % (transaction_id,
                                                             response)
                raise Exception(msg)
            transactions = response['result']
            transaction = transactions[0]
            return transaction['state']

        while True:
            state = _get_trans_state()
            if state in ('check-failed', 'finished', 'rollbacked', 'error'):
                if state != 'finished':
                    # TODO(dsj): code 400 should be improved
                    raise mana_utils.ManaClientException(400, state)
                else:
                    return state
            time.sleep(1)
