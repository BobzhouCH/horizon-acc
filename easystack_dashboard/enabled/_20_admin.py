# Copyright 2015, Hewlett-Packard Development Company, L.P.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# The slug of the dashboard to be added to HORIZON['dashboards']. Required.
DASHBOARD = 'admin'
# If set to True, this dashboard will be set as the default dashboard.
DEFAULT = False
# A list of applications to be added to INSTALLED_APPS.
ADD_INSTALLED_APPS = [
    'easystack_dashboard.dashboards.admin',
]
ADD_ANGULAR_MODULES = ['hz.dashboard',
                       'hz.dashboard.admin']

LAUNCH_INST = ''
ADD_JS_FILES = [
    'dashboard/admin/instance_snapshots/instance_snapshot.js',
    'dashboard/admin/instance_snapshots/action.delete.js',
    'dashboard/admin/instance_snapshots/table.js',
    'dashboard/admin/instance_snapshots/form.js',
    'dashboard/admin/instance_snapshots/action.edit.js',
    'dashboard/admin/instance_snapshots/action.createvolume.js',

    'dashboard/admin/admin.module.js',
    'dashboard/workflow/workflow.module.js',
    'dashboard/cloud-services/cloud-services.js',
    'dashboard/tech-debt/tech-debt.module.js',
    'dashboard/tech-debt/namespace-ctrl.js',
    'dashboard/tech-debt/image-form-ctrl.js',

    'dashboard/admin/billing/billing.js',
    'dashboard/admin/billing/table.controller.js',
    'dashboard/admin/billing/table.directive.js',
    'dashboard/admin/billing/action.create.js',
    'dashboard/admin/billing/action.delete.js',
    'dashboard/admin/billing/form.js',

    'dashboard/admin/bill/bill.js',
    'dashboard/admin/bill/table.js',

    'dashboard/admin/flavors/flavors.js',
    'dashboard/admin/flavors/table.js',
    'dashboard/admin/flavors/form.js',
    'dashboard/admin/flavors/action.create.js',
    'dashboard/admin/flavors/action.edit.js',
    'dashboard/admin/flavors/action.delete.js',
    'dashboard/admin/flavors/extra_specs/action.detail.js',
    'dashboard/admin/flavors/extra_specs/detail.controller.js',
    'dashboard/admin/flavors/extra_specs/action.create.js',
    'dashboard/admin/flavors/extra_specs/action.delete.js',
    'dashboard/admin/flavors/extra_specs/form.js',

    'dashboard/admin/volumes/volumes.js',
    'dashboard/admin/volumes/table.js',
    'dashboard/admin/volumes/form.js',
    'dashboard/admin/volumes/action.delete.js',
    'dashboard/admin/volumes/action.edit.js',
    'dashboard/admin/volumes/action.update-volume-status.js',

    'dashboard/admin/volume_snapshots/volume_snapshots.js',
    'dashboard/admin/volume_snapshots/table.js',
    'dashboard/admin/volume_snapshots/form.js',
    'dashboard/admin/volume_snapshots/action.update-volumesnapshot-status.js',

    'dashboard/admin/volume_types/volume_types.js',
    'dashboard/admin/volume_types/table.js',
    'dashboard/admin/volume_types/form.js',
    'dashboard/admin/volume_types/directive.js',
    'dashboard/admin/volume_types/action.create.js',
    'dashboard/admin/volume_types/action.edit.js',
    'dashboard/admin/volume_types/action.delete.js',

    'dashboard/admin/networks/networks.js',
    'dashboard/admin/networks/table.js',
    'dashboard/admin/networks/form.js',
    'dashboard/admin/networks/action.create.js',

    'dashboard/admin/images/images.js',
    'dashboard/admin/images/table.js',
    'dashboard/admin/images/action.edit.js',
    'dashboard/admin/images/action.create.js',
    'dashboard/admin/images/action.delete.js',
    'dashboard/admin/images/action.image2volume.js',

    'dashboard/admin/routers/routers.js',
    'dashboard/admin/routers/table.js',

    'dashboard/admin/instances/instances.js',
    'dashboard/admin/instances/table.js',
    'dashboard/admin/instances/form.js',
    'dashboard/admin/instances/action.live-migrate.js',
    'dashboard/admin/instances/action.cold-migrate.js',
    'dashboard/admin/instances/action.start.js',
    'dashboard/admin/instances/action.shutoff.js',
    'dashboard/admin/instances/action.delete.js',
    'dashboard/admin/instances/action.edit.js',
    'dashboard/admin/instances/action.createsnapshot.js',

    'dashboard/admin/easystack_overview/overview.js',
    'dashboard/admin/easystack_overview/table.js',

    'dashboard/admin/invcodes/invcodes.js',
    'dashboard/admin/invcodes/table.js',
    'dashboard/admin/invcodes/form.js',
    'dashboard/admin/invcodes/action.create.js',
    'dashboard/admin/invcodes/action.delete.js',

    'dashboard/admin/info/info.js',
    'dashboard/admin/info/table.js',

    'dashboard/admin/hypervisor/hypervisor.js',
    'dashboard/admin/hypervisor/table.js',
    'dashboard/admin/hypervisor/form.js',
    'dashboard/admin/hypervisor/action.disable.js',

    'dashboard/admin/notice/notice.js',
    'dashboard/admin/notice/table.js',

    'dashboard/admin/aggregates/aggregates.js',
    'dashboard/admin/aggregates/table.js',
    'dashboard/admin/aggregates/form.js',
    'dashboard/admin/aggregates/action.create.js',
    'dashboard/admin/aggregates/action.edit.js',
    'dashboard/admin/aggregates/action.delete.js',
    'dashboard/admin/aggregates/action.edit.host.js',

    'dashboard/admin/tickets/tickets.js',
    'dashboard/admin/tickets/action.create.js',
    'dashboard/admin/tickets/action.delete.js',
    'dashboard/admin/tickets/action.edit-status.js',
    'dashboard/admin/tickets/table.js',
    'dashboard/admin/tickets/form.js',
    'dashboard/admin/tickets/action.detail.js',

    'dashboard/admin/server_groups/server_groups.js',
    'dashboard/admin/server_groups/table.js',
    'dashboard/admin/server_groups/form.js',
    'dashboard/admin/server_groups/action.create.js',
    'dashboard/admin/server_groups/action.delete.js',
    'dashboard/admin/server_groups/action.detail.js',
    'dashboard/admin/security_settings/security_settings.js',
    'dashboard/admin/security_settings/index.js',

    'dashboard/admin/optimize/echarts/esl.js',
    'dashboard/admin/optimize/echarts/echarts.js',
    'dashboard/admin/optimize/echarts/chart/chord.js',
    'dashboard/admin/optimize/echarts/chart/line.js',
    'dashboard/admin/optimize/echarts/chart/bar.js',
    'dashboard/admin/optimize/optimize.js',
    'dashboard/admin/optimize/hostChartCtrl.js',
    'dashboard/admin/optimize/action.conduct.js',
    'dashboard/admin/optimize/action.detail.js',

    'dashboard/admin/security_settings/security_settings.js',
    'dashboard/admin/security_settings/index.js',
]


ADD_JS_SPEC_FILES = [
    'dashboard/dashboard.module.spec.js',
    'dashboard/cloud-services/cloud-services.spec.js',
]
