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

# The slug of the dashboard to be added to HORIZON['dashboards']. Required.
DASHBOARD = 'identity'
# If set to True, this dashboard will be set as the default dashboard.
DEFAULT = False
# A dictionary of exception classes to be added to HORIZON['exceptions'].
ADD_EXCEPTIONS = {}
# A list of applications to be added to INSTALLED_APPS.
ADD_INSTALLED_APPS = ['easystack_dashboard.dashboards.identity']

ADD_ANGULAR_MODULES = [
    'hz.dashboard',
    'hz.dashboard.identity',
]

ADD_JS_FILES = [
    'dashboard/identity/identity.module.js',
    'dashboard/identity/users/users.module.js',
    'dashboard/identity/users/form.js',
    'dashboard/identity/users/table.js',
    'dashboard/identity/users/action.create.js',
    'dashboard/identity/users/action.delete.js',
    'dashboard/identity/users/action.edit.js',
    'dashboard/identity/users/action.enable.js',
    'dashboard/identity/users/action.password.js',

    'dashboard/identity/projects/projects.module.js',
    'dashboard/identity/projects/form.js',
    'dashboard/identity/projects/table.js',
    'dashboard/identity/projects/action.create.js',
    'dashboard/identity/projects/action.delete.js',
    'dashboard/identity/projects/action.edit.js',
    'dashboard/identity/projects/action.enable.js',
    'dashboard/identity/projects/action.edit-quota.js',
    'dashboard/identity/projects/action.edit-users.js',
    'dashboard/identity/projects/project-quota.service.js',
    'dashboard/identity/projects/project-quota.directives.js',

    'dashboard/identity/domains/domains.module.js',
    'dashboard/identity/domains/table.js',
    'dashboard/identity/domains/action.create.js',
    'dashboard/identity/domains/form.js',
    'dashboard/identity/domains/action.delete.js',
    'dashboard/identity/domains/action.edit-quota.js',
    'dashboard/identity/domains/action.edit.js',
    'dashboard/identity/domains/action.enable.js',
    'dashboard/identity/domains/action.edit-users.js',
    'dashboard/identity/domains/domain-quota.directives.js',

]

ADD_JS_SPEC_FILES = [
]

ADD_SCSS_FILES = [
]
