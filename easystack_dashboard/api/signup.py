import logging
import json
import urllib

from datetime import datetime
from django.http import response
from django.http.response import HttpResponse
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from keystoneclient.v3 import client

from easystack_dashboard.api import billing as billing_api
from easystack_dashboard.api import keystone
from easystack_dashboard.api import chakra
from chakraclient.exc import HTTPNotFound


LOG = logging.getLogger(__name__)

INVCODE_STATUS = ['Available','Overtime','Used','Wrong_status','Verify_failed']

def keystoneclient(request):

    # Take care of client connection caching/fetching a new client.
    cache_attr = "_keystoneclient"
    if (hasattr(request, cache_attr)):
        conn = getattr(request, cache_attr)
    else:
        auth_url = getattr(settings, 'OPENSTACK_KEYSTONE_URL')
        endpoint_override = getattr(settings, 'OPENSTACK_KEYSTONE_URL')
        LOG.debug("Creating a new keystoneclient connection to %s." % auth_url)
        conn = client.Client(auth_url=auth_url,
                             noauth=True,
                             endpoint_override=endpoint_override)
        setattr(request, cache_attr, conn)
    return conn

def verify_email(request, email):
    manager = keystoneclient(request).users
    return manager.get_registration_by_query(email=email)


def resend_email(request, email):
    try:
        manager = keystoneclient(request).users
    except Exception as e:
        raise e
    return manager.reconfirm_registration(email=email)


def verify_name(request, name):
    manager = keystoneclient(request).users
    return manager.get_registration_by_query(name=name)


def create_user(request, data):
    manager = keystoneclient(request).users
    try:
        user = manager.create(**data)
        if getattr(settings, 'ENABLE_BILLING', True):
            create_billingaccount(request,
                                  data.get('name'),
                                  user.domain_id,
                                  data.get("reg_code"))

        invcode_enable = getattr(settings, 'INVCODE_ENABLE', True)
        invcode_register = getattr(settings, 'INVCODE_REGISTER', True)
        content = ''
        if invcode_enable and invcode_register:
            # user = manager.find(id=user.id)
            # if not user:
            #     raise Exception("Failed to get the registered user")
            try:
                invcode = user.reg_code
            except Exception:
                raise Exception("Failed to get the invitation code")

            try:
                data = chakra.invcode_check(request, invcode)
                if data:
                    result = data['status']
                else:
                    raise Exception(
                        _("Failed to check Invitation Code, " +
                          "Please make sure code is available"))
                if result != INVCODE_STATUS[0]:
                    raise Exception(
                        _("Failed to check Invitation Code, " +
                          "Please make sure code is available"))

                use_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                content = chakra.invcode_update(request, str(invcode),
                                                status=1,
                                                use_at=use_at,
                                                use_by=user.name)
                if getattr(settings, 'ENABLE_BILLING', True):
                    # create payment for invcode
                    body = {"ptype": "invcode",
                            "amount": data['worth'],
                            "trade_success": 1,
                            "account_id": billing_api.get_account_id(
                                request, user.domain_id)}
                    content = chakra.payment_create(request, **body)
            except:
                pass

        resend_email(request, user.email)
    except Exception as e:
        raise e


def admin_active_user(request, user_id):
    manager = keystoneclient(request).users
    user = manager.find(id=user_id)
    if not user:
        raise Exception("Failed to get the registered user")
    try:
        user = manager.active_registration(user_id)
    except Exception as e:
        raise e
    return user


def active_user(request, user_id):
    manager = keystoneclient(request).users
    try:
        user = manager.active_registration(user_id)
    except Exception as e:
        raise e
    return user


def create_billingaccount(request, name, domain_id, invcode):
    body = {"balance": 0,
            "ref_resource": domain_id,
            "name": name}
    content = chakra.account_create(request, **body)
    return content


def verify_invitation_code(request):
    """Check if the phone verify code is right"""
    if len(request.body) > 0:
        dic = eval(request.body)
        code = str(dic.get('invitation_code'))
        content = ''
        try:
            result = chakra.invcode_check(request, code)
            if not result :
                content = _("Wrong Code")
            else:
                if (result['status'] != INVCODE_STATUS[0]):
                    content = _('Wrong Code') 	
                else:
                    content = "True"
            return HttpResponse(content, content_type="application/json")
        except HTTPNotFound:
            content = _("Wrong Code")
            return HttpResponse(content, content_type="application/json")
        except:
            return response.HttpResponseServerError(content)
    return response.HttpResponseBadRequest("invitation code is null")
