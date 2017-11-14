# The slug of the dashboard to be added to HORIZON['dashboards']. Required.
DASHBOARD = 'settings'

# A list of applications to be added to INSTALLED_APPS.
ADD_INSTALLED_APPS = [
    'easystack_dashboard.dashboards.settings',
]

ADD_ANGULAR_MODULES = [
    'hz.dashboard',
    'hz.dashboard.settings',
]

ADD_JS_FILES = [
    'dashboard/dashboard.module.js',
    'dashboard/settings/settings.module.js',

    'dashboard/settings/password/password.module.js',
    'dashboard/settings/password/form.js',
    'dashboard/settings/password/action.edit.js',
    #begin:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    'dashboard/settings/password/action.license.js',
    'dashboard/settings/password/license_form.js',
    #end:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    'dashboard/settings/password/action.logout.js',
    'dashboard/settings/password/logout_form.js',

    'dashboard/settings/lang/lang.module.js',
    'dashboard/settings/lang/action.lang.js',

    'dashboard/settings/ticket/ticket.module.js',
]

ADD_JS_SPEC_FILES = [

]
