# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
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

import logging
import os
import sys
import warnings

import django
from django.utils.translation import ugettext_lazy as _  # noqa

from easystack_dashboard import exceptions
from easystack_dashboard.static_settings import get_staticfiles_dirs  # noqa

warnings.formatwarning = lambda message, category, *args, **kwargs: \
    '%s: %s' % (category.__name__, message)

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.abspath(os.path.join(ROOT_PATH, '..', 'bin'))

if ROOT_PATH not in sys.path:
    sys.path.append(ROOT_PATH)

DEBUG = False
TEMPLATE_DEBUG = DEBUG

SITE_BRANDING = 'ESCloud'

FLOATINGIP_BANDWIDTH = 30
INTERNAL_FLOATINGIP_BANDWIDTH = 1000
BILLING_URL = '127.0.0.1'
BILLING_PORT = '7206'
# pre-billing
PREBILLING = False
CHAKRA_URL = '127.0.0.1'
CHAKRA_PORT = '7207'
BILLING_USER = 'admin'
BILLING_PASSWORD = 'passw0rd'
ENABLE_BILLING = True
INVCODE_RECHARGE = False
YEEPAY_RECHARGE = False
ALIPAY_RECHARGE = False
SMTP_SERVER = 'localhost'
SENDER = 'noreply'
SMTP_PW = None
GANGLIA_URL = '127.0.0.1'
NAGIOS_URL = '/var/log/nagios/status.dat'
ACCESS_URL = "http://127.0.0.1"
ACCESS_PORT = 80
ACCESS_LOGIN = "%s:%s" % (ACCESS_URL, ACCESS_PORT)

INVCODE_ENABLE = True
INVCODE_REGISTER = True
CAPTCHA_ENABLE = True
MANILA_ENABLED = False
MAGNUM_ENABLED = False
HEAT_ENABLED = False
DEFAULT_BAYMODEL = "defaultbaymodel"

LDAP_ENABLE = False
LDAP_EDITABLE = True

MANA_ENABLE = False

SAHARA_ENABLED = False

# domain_quota switch :if you set this is true in the local_setting ,
# you should also change the keystone conf file in the path:
# /etc/keystone/keystone.conf domain_quota_enabled = true
DOMAIN_QUOTA_ENABLED = False

WEBROOT = '/'
LOGIN_URL = None
LOGOUT_URL = None
LOGIN_REDIRECT_URL = None
ENABLE_BOOT_FROM_VOLUME = False

USE_FANCIER_NETWORK_TOPOLOGY = False

EMAIL_ACTIVATION = True

LOGO_URL = 'http://www.easystack.cn'

# EasyStack url define
ROOT_URLCONF = 'easystack_dashboard.urls'

# EasyStack dashboard define, including admin and project
HORIZON_CONFIG = {
    'user_home': 'easystack_dashboard.views.get_user_home',
    'ajax_queue_limit': 10,
    'auto_fade_alerts': {
        'delay': 3000,
        'fade_duration': 1500,
        'types': ['alert-success', 'alert-info']
    },
    'help_url': "http://docs.openstack.org",
    'exceptions': {'recoverable': exceptions.RECOVERABLE,
                   'not_found': exceptions.NOT_FOUND,
                   'unauthorized': exceptions.UNAUTHORIZED},
    'angular_modules': [],
    'js_files': [],
    'js_spec_files': [],
}

# Set to True to allow users to upload images to glance via Horizon server.
# When enabled, a file form field will appear on the create image form.
# See documentation for deployment considerations.
HORIZON_IMAGES_ALLOW_UPLOAD = True

# The OPENSTACK_IMAGE_BACKEND settings can be used to customize features
# in the OpenStack Dashboard related to the Image service, such as the list
# of supported image formats.
OPENSTACK_IMAGE_BACKEND = {
    'image_formats': [
        ('qcow2', _('QCOW2')),
        ('raw', _('Raw')),
    ]
}

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'horizon.middleware.HorizonMiddleware',
    'django.middleware.common.CommonMiddleware'
)
if django.VERSION >= (1, 8, 0):
    MIDDLEWARE_CLASSES += (
        'django.contrib.auth.middleware.SessionAuthenticationMiddleware',)
else:
    MIDDLEWARE_CLASSES += ('django.middleware.doc.XViewMiddleware',)
MIDDLEWARE_CLASSES += (
    'django.middleware.locale.LocaleMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.contrib.messages.context_processors.messages',
    'horizon.context_processors.horizon',
    'easystack_dashboard.context_processors.openstack',
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'horizon.loaders.TemplateLoader'
)

TEMPLATE_DIRS = (
    os.path.join(ROOT_PATH, 'templates'),
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

COMPRESS_PRECOMPILERS = (
    ('text/scss', 'django_pyscss.compressor.DjangoScssFilter'),
)

COMPRESS_CSS_FILTERS = (
    'compressor.filters.css_default.CssAbsoluteFilter',
)

COMPRESS_ENABLED = True
COMPRESS_OUTPUT_DIR = 'dashboard'
COMPRESS_CSS_HASHING_METHOD = 'hash'
COMPRESS_PARSER = 'compressor.parser.HtmlParser'

INSTALLED_APPS = (
    'lenovo_dashboard',
    'easystack_dashboard',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django_pyscss',
    'easystack_dashboard.django_pyscss_fix',
    'compressor',
    'horizon',
    'openstack_auth',
)

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
AUTHENTICATION_BACKENDS = ('openstack_auth.backend.KeystoneBackend',)
AUTHENTICATION_URLS = ['openstack_auth.urls']
MESSAGE_STORAGE = 'django.contrib.messages.storage.fallback.FallbackStorage'

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_HTTPONLY = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SECURE = False
# 12 hours
SESSION_TIMEOUT = 43200
# A token can be near the end of validity when a page starts loading, and
# invalid during the rendering which can cause errors when a page load.
# TOKEN_TIMEOUT_MARGIN defines a time in seconds we retrieve from token
# validity to avoid this issue. You can adjust this time depending on the
# performance of the infrastructure.
TOKEN_TIMEOUT_MARGIN = 60

# When using cookie-based sessions, log error when the session cookie exceeds
# the following size (common browsers drop cookies above a certain size):
SESSION_COOKIE_MAX_SIZE = 4093

# when doing upgrades, it may be wise to stick to PickleSerializer
# NOTE(berendt): Check during the K-cycle if this variable can be removed.
#                https://bugs.launchpad.net/horizon/+bug/1349463
SESSION_SERIALIZER = 'django.contrib.sessions.serializers.PickleSerializer'

gettext_noop = lambda s: s
LANGUAGES = (
    ('zh-cn', gettext_noop('Simplified Chinese')),
    ('en', gettext_noop('English')),
)
LANGUAGE_CODE = 'zh-cn'
LANGUAGE_COOKIE_NAME = 'horizon_language'
USE_I18N = True
USE_L10N = True
USE_TZ = True

OPENSTACK_KEYSTONE_DEFAULT_ROLE = 'admin'

DEFAULT_EXCEPTION_REPORTER_FILTER = 'horizon.exceptions.HorizonReporterFilter'

POLICY_FILES_PATH = os.path.join(ROOT_PATH, "conf")
# Map of local copy of service policy files
POLICY_FILES = {
    'identity': 'keystone_policy.json',
    'compute': 'nova_policy.json',
    'volume': 'cinder_policy.json',
    'image': 'glance_policy.json',
    'orchestration': 'heat_policy.json',
    'network': 'neutron_policy.json',
    'telemetry': 'ceilometer_policy.json',
}

SECRET_KEY = None
LOCAL_PATH = None

SECURITY_GROUP_RULES = {
    'all_tcp': {
        'name': _('All TCP'),
        'ip_protocol': 'tcp',
        'from_port': '1',
        'to_port': '65535',
    },
    'all_udp': {
        'name': _('All UDP'),
        'ip_protocol': 'udp',
        'from_port': '1',
        'to_port': '65535',
    },
    'all_icmp': {
        'name': _('All ICMP'),
        'ip_protocol': 'icmp',
        'from_port': '-1',
        'to_port': '-1',
    },
}

ADD_INSTALLED_APPS = []

FLOATING_IP_QOS_RULES = {
    'INTERNET': {
        'name': 'internet',
        'bandwidthMin': 1,
        'bandwidthMax': 30
    },
    'INTRANET': {
        'name': 'intranet',
        'bandwidthMin': 800,
        'bandwidthMax': 800
    }
}
FLOATING_IP_QOS_RULES_ENABLED = False
LENOVO_FLAVOR_ENABLED = False
LENOVO_FLAVOR_CONFIG = {
    'RAM_STEP': [
        [2, 4, 2],
        [3, 5, 3],
        [4, 6, 4],
        [5, 7, 5],
        [6, 7, 6],
        [0, 0, 0]
    ],
    'VOLUME_CONFIG': {
        'LINUX': [20, 30, 40],
        'WINDOWS': [100]
    }
}

# AWS settings
CONFIG_FILE_URL = "/etc/hybridcloud/hybridcloud.conf"
PULIC_CLOUD_RULES = {
    'isNotPublicRegion': {
        'project-instances-aws-create-instances': True,
        'project-image-default-search-input': False,
        'project-image-id-search': True,
    },
    'aws': {
        'is_public_cloud': True,
        'Volume_Snapshots': True,
        'easystack_overview': False,
        'EasyStack_Admin': True,
        'Alarms': True,
        'OperationLogs': True,
        'Networks': True,
        'Routers': True,
        'Firewalls': True,
        'FloatingIP': True,
        'SharedFiles': True,
        'Instance_Snapshots': True,
        'Security_Groups': True,
        'Keypairs': True,
        'Identity': True,
        'Billing': True,
        'NetworkTopology': True,
        'containers': True,
        'Tickets': True,
        'loadbalancersv2': True,
        'ports': True,
        'community_network_topology': True,
        'Volume Backups': True,
        'project-instances-console-instance': True,
        'project-instances-edit': True,
        'project-instances-resize': True,
        'project-instances-hot-extend-disk': True,
        'project-instances-suspend': True,
        'project-instances-resume': True,
        'project-instances-pause': True,
        'project-instances-unpause': True,
        'project-instances-associate-floating-iP': True,
        'project-instances-disassociate-floating-iP': True,
        'project-instances-associate-network': True,
        'project-instances-disassociate-network': True,
        'project-instances-edit-Security-group': True,
        'project-instances-monitor': True,
        'project-instances-rebuild-instance': True,
        'project-instances-tab-instance-consolelog': True,
        'project-instances-tab-instance-console': True,
        'project-instances-tab-instance-id': True,
        'project-instances-tab-instance-uptime': True,
        'project-instances-tab-instance-availability-zone': True,
        'project-instances-tab-resources': True,
        'project-instances-disk': True,
        'project-instances-create-instances': True,
        'project-volumes-more': True,
        'project-volumes-tab-volume-snapshot': True,
        'project-volumes-tab-volume-id': True,
        'project-volumes-form-name': True,
        'project-image-created-at': True,
        'project-image-updated-at': True,
        'project-easystack-overview-table': True,
        'admin-easystack-overview-table': True,
        'project-image-id-search': False,
        'project-image-default-search-input': True,
        'top-project-menu-aws': True,
        'top-ticket-menu-aws': True,
        'project-volumes-form-source': True,
        'project-volumes-form-description': True,
        'project-volumes-description': True,
        'project-instances-tab-specs-disk': True,
        'project-overview-network': True,
        'project-overview-keypair': True,
        'project-overview-snapshot': True,
        'project-overview-activities': True,
        'project-overview-volume_backups': True,
    },
}


# STATIC directory for custom theme, set as default.
# It can be overridden in local_settings.py
CUSTOM_THEME_PATH = 'static/themes/default'

# Following is settings for alipay
ALIPAY_KEY = 'TBU'
ALIPAY_INPUT_CHARSET = 'utf-8'
# partner ID
ALIPAY_PARTNER = 'TBU'
# alipay account
ALIPAY_SELLER_EMAIL = 'TBU'
ALIPAY_SIGN_TYPE = 'MD5'
ALIPAY_SHOW_URL = ''
# only https works in our test
ALIPAY_TRANSPORT = 'https'
ALIPAY_SUBJECT = 'Billing'
# Following is settings for yeepay
YEEPAY_ID = '10001126856'
YEEPAY_REQUEST_URL = "https://www.yeepay.com/app-merchant-proxy/node"
YEEPAY_KEY = "69cl522AV6q613Ii4W6u8K6XuW8vM1N6bFgyv769220IuYe9u37N4y7rI4Pl"
MAX_VOLUME_SIZE = 1000
try:
    from local.local_settings import *  # noqa
except ImportError:
    logging.warning("No local_settings file found.")

ALIPAY_RETURN_URL = ACCESS_LOGIN + WEBROOT + 'project/billing/alipay_url'
ALIPAY_NOTIFY_URL = ALIPAY_RETURN_URL

YEEPAY_RETURN_URL = ACCESS_LOGIN + WEBROOT + 'project/billing/yeepay_url'

if not WEBROOT.endswith('/'):
    WEBROOT += '/'
if LOGIN_URL is None:
    LOGIN_URL = WEBROOT + 'auth/login/'
if LOGOUT_URL is None:
    LOGOUT_URL = WEBROOT + 'auth/logout/'
if LOGIN_REDIRECT_URL is None:
    LOGIN_REDIRECT_URL = WEBROOT

MEDIA_ROOT = os.path.abspath(os.path.join(ROOT_PATH, '..', 'media'))
MEDIA_URL = WEBROOT + 'media/'
STATIC_ROOT = os.path.abspath(os.path.join(ROOT_PATH, '..', 'static'))
STATIC_URL = WEBROOT + 'static/'
STATICFILES_DIRS = get_staticfiles_dirs(WEBROOT)

CUSTOM_THEME = os.path.join(ROOT_PATH, CUSTOM_THEME_PATH)
STATICFILES_DIRS.append(
    ('custom', CUSTOM_THEME),
)


# Load the pluggable dashboard settings
import easystack_dashboard.enabled
import easystack_dashboard.local.enabled
from easystack_dashboard.utils import settings

INSTALLED_APPS = list(INSTALLED_APPS)  # Make sure it's mutable
settings.update_dashboards(
    [
        easystack_dashboard.enabled,
        easystack_dashboard.local.enabled,
    ],
    HORIZON_CONFIG,
    INSTALLED_APPS,
)
INSTALLED_APPS[0:0] = ADD_INSTALLED_APPS

NOTPUBLICREGION_MAGIC_WORD = 'isNotPublicRegion'

# Ensure that we always have a SECRET_KEY set, even when no local_settings.py
# file is present. See local_settings.py.example for full documentation on the
# horizon.utils.secret_key module and its use.
if not SECRET_KEY:
    if not LOCAL_PATH:
        LOCAL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                  'local')

    from horizon.utils import secret_key
    SECRET_KEY = secret_key.generate_or_read_from_file(os.path.join(LOCAL_PATH,
                                                                    '.secret_key_store'))

from easystack_dashboard import policy_backend
POLICY_CHECK_FUNCTION = policy_backend.check

# Add HORIZON_CONFIG to the context information for offline compression
COMPRESS_OFFLINE_CONTEXT = {
    'WEBROOT': WEBROOT,
    'STATIC_URL': STATIC_URL,
    'HORIZON_CONFIG': HORIZON_CONFIG
}

if DEBUG:
    logging.basicConfig(level=logging.DEBUG)

# during django reloads and an active user is logged in, the monkey
# patch below will not otherwise be applied in time - resulting in developers
# appearing to be logged out.  In typical production deployments this section
# below may be omitted, though it should not be harmful
from openstack_auth import utils as auth_utils
auth_utils.patch_middleware_get_user()

# Nova related Settings
# reserved_host_memory_mb in each compute node config file
# if RESERVED_HOST_MEMORY_MB_TOTAL set with -1 , use  RESERVED_HOST_MEMORY_MB * number
# of compute nodes, otherwise use RESERVED_HOST_MEMORY_MB_TOTAL
RESERVED_HOST_MEMORY_MB = 512
RESERVED_HOST_MEMORY_MB_TOTAL = -1
DEBUG_TOAST_ENABLED = False
MANILA_SHARE_SIZE_MAX = 500

LOGIN_SMTP_SERVER = True
USE_FANCIER_NETWORK_TOPOLOGY = True
