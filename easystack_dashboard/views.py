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
from PIL import Image, ImageDraw, ImageFont
import cStringIO
import string
import os
import random
import json

from django import shortcuts
import django.views.decorators.vary
from django.http.response import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings
from settings import ROOT_PATH

import horizon
from horizon import base
from horizon import exceptions

from openstack_auth import utils as auth_utils

import easystack_dashboard.api.signup as signup
import easystack_dashboard.api.keystone as keystone

def get_user_home(user):
    dashboard = None
    VERSIONS = auth_utils.get_keystone_version()
    if VERSIONS == 3:
        if user.user_domain_name == 'Default' and user.is_superuser:
            try:
                dashboard = horizon.get_dashboard('admin')
            except base.NotRegistered:
                pass
    else:
        if user.is_superuser:
            try:
                dashboard = horizon.get_dashboard('admin')
            except base.NotRegistered:
                pass

    if dashboard is None:
        dashboard = horizon.get_default_dashboard()

    if user.token.project.get('id') is None:
        dashboard = horizon.get_dashboard('identity')

    return dashboard.get_absolute_url()


@django.views.decorators.vary.vary_on_cookie
def splash(request):
    if not request.user.is_authenticated():
        raise exceptions.NotAuthenticated()

    if len(request.user.authorized_tenants) <= 0:
        raise exceptions.NotAuthenticated()

    # if keystone.is_domain_admin(request)[1] and \
    #         keystone.is_project_admin(request)[1]:
    #     response = shortcuts.redirect(horizon.get_user_home(request.user))

    webroot = getattr(settings, 'WEBROOT')
    if keystone.is_domain_admin(request)[1]:
        if keystone.is_public_region(request):
            response = shortcuts.redirect(webroot + 'project/instances/')
        else:
            response = shortcuts.redirect(horizon.get_user_home(request.user))
    else:
        dashboard = horizon.get_default_dashboard()
        if request.user.token.project.get('id') is None:
            dashboard = horizon.get_dashboard('identity')
        if keystone.is_public_region(request):
            response = shortcuts.redirect(webroot + 'project/instances/')
        else:
            response = shortcuts.redirect(dashboard.get_absolute_url())

    if 'logout_reason' in request.COOKIES:
        response.delete_cookie('logout_reason')
    return response


def register(request):
    _context = RequestContext(request)
    invcode_enable = getattr(settings, 'INVCODE_ENABLE', True)
    invcode_register = getattr(settings, 'INVCODE_REGISTER', True)
    _context.update(
        {"INVCODE_NEED": invcode_enable and invcode_register,
         "CAPTCHA_ENABLE": getattr(settings, 'CAPTCHA_ENABLE', True)})
    return render_to_response('register/register.html', _context)

def agreement(request):
    _context = RequestContext(request)
    invcode_enable = getattr(settings, 'INVCODE_ENABLE', True)
    invcode_register = getattr(settings, 'INVCODE_REGISTER', True)
    _context.update(
        {"INVCODE_NEED": invcode_enable and invcode_register,
         "CAPTCHA_ENABLE": getattr(settings, 'CAPTCHA_ENABLE', True)})
    return render_to_response('register/agreement.html', _context)


def active_reminder(request):
    _context = RequestContext(request)
    _context.update(
        {"login_url": getattr(settings, 'ACCESS_LOGIN', 'http://127.0.0.1')})
    if request.method == 'GET':
        query = request.GET
        email = query.get('email')
        _context.update({'email': email})
        _context.update({'resent': False})
        return render_to_response('register/active_reminder.html',
                                  _context)
    email = request.POST.get('email')
    try:
        user = signup.resend_email(request, email)
    except Exception as e:
        _context.update({"error_message": e.message})
        return render_to_response('register/error.html', _context)
    _context.update({'email': email})
    _context.update({'resent': True})
    return render_to_response('register/active_reminder.html', _context)


def captcha(request):
    '''Captcha'''
    # model, size, background color
    image = Image.new('RGB', (160, 40), color=(255, 255, 255))
    font_file = os.path.join(ROOT_PATH, 'static/register/fonts/monaco.ttf')
    # The font object
    font = ImageFont.truetype(font_file, 35)
    draw = ImageDraw.Draw(image)
    # width, height, chance, draw
    _create_points(160, 40, 3, draw)
    # The random string
    rand_str = ''.join(random.sample(string.letters + string.digits, 6))
    event_code = ''.join(random.sample(string.digits, 10))
    # position, content, color, font
    i = 10
    for char in rand_str:
        draw.text((i, 0), char, _rand_rgb(), font=font)
        i += 25
    del draw
    # store the content in Django's session store
    request.session['captcha'] = rand_str.lower()
    # a memory buffer used to store the generated image
    buf = cStringIO.StringIO()
    image.save(buf, "JPEG")
    return HttpResponse(buf.getvalue(), mimetype="image/png")


def _create_points(width, height, chance, draw):
    for w in xrange(width):
        for h in xrange(height):
            tmp = random.randint(0, 100)
            if tmp > 100 - chance:
                draw.point((w, h), fill=(0, 0, 0))


def _rand_rgb():
    '''Generate a random rgb color.'''
    return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))


def verify(request):
    dic = eval(request.body)
    code = dic.get('code')
    session_code = request.session.get('captcha')
    if code == None or session_code == None:
        return HttpResponse("False", content_type="text/plain")
    if code.lower() == session_code:
        return HttpResponse("True", content_type="text/plain")
    return HttpResponse("False", content_type="text/plain")


def verify_email(request):
    """Check if the email address is occupied"""
    if len(request.body) > 0:
        dic = eval(request.body)
        email = dic.get('email')
        user = signup.verify_email(request, email)
        if user == None or len(user) == 0:
            return HttpResponse("True", content_type="application/json")
    return HttpResponse("False", content_type="application/json")


def phone_code(request):
    """Send out the phone verify code"""
    """Check if the phone verify code is right"""
    if len(request.body) > 0:
        dic = eval(request.body)
        mobile_phone = dic.get('mobile_phone')
        if mobile_phone:
            return HttpResponse("Has sent the code", content_type="application/json")
        code = dic.get('phone_code')
        # check(code)
        return HttpResponse("True", content_type="application/json")


def user(request):
    if len(request.body) > 0:
        dic = eval(request.body)
        user = dic.get('user')
        name = user.get('name')
        data = signup.verify_name(request, name)
        if data == None or len(data) == 0:
            reg_code = user.get('reg_code')
            if reg_code:
                user.update({'reg_code': reg_code.replace('+', '')})
            if getattr(settings, 'MANA_ENABLE', False):
                project_name = getattr(
                    settings, 'DEDICATED_PREFIX', 'dedicated:')
                user.update({'mana': project_name + 'default'})
            try:
                signup.create_user(request, user)
            except Exception as e:
                return HttpResponse(e.message,
                                    status=500, content_type="application/json")
            return HttpResponse('active_reminder',
                                status=200, content_type="application/json")
        else:
            return HttpResponse(
                "The name has been occupied",
                status=409, content_type="application/json")
    return HttpResponse("Failed to sign up",
                        status=500, content_type="application/json")


def active_user(request, user_id):
    _context = RequestContext(request)
    if request.method == "GET":
        try:
            signup.active_user(request, user_id)
        except Exception as e:
            _context.update({"error_message": e.message})
            return render_to_response('register/error.html', _context)
        _context.update(
            {"login_url": getattr(settings, 'ACCESS_LOGIN', 'http://127.0.0.1')})
        return render_to_response('register/active_user.html', _context)


def department(request):
    """Get Department List"""
    items = ['Market', 'Purchase', 'IT', 'Human Resource', 'Others']
    return HttpResponse(json.dumps({"items": items}),
                        status=200, content_type="application/json")
