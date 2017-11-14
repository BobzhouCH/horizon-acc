# Copyright 2012 OpenStack Foundation
# Copyright 2010 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# Copyright 2011 - 2012 Justin Santa Barbara
# All Rights Reserved.
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
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from easystack_dashboard.api.rest import utils as rest_utils


LOG = logging.getLogger(__name__)


class Email(object):

    def __init__(self, smtp_server, sender, password):
        self.smtpserver = smtp_server
        self.sender = sender
        self.password = password
        self.msg = MIMEMultipart()
        self.smtp = smtplib.SMTP()

    def set_email_header(self, receiver, subject):
        self.msg['From'] = self.sender
        self.msg['To'] = receiver
        self.msg['Subject'] = subject

    def set_email_body(self, cont):
        body = MIMEText('%s' % cont, 'html', 'utf-8')
        self.msg.attach(body)

    def send_email(self, receiver, subject, cont):
        # do not need to login to smtp server by default
        login_smtp_server = getattr(settings, 'LOGIN_SMTP_SERVER', False)

        try:
            self.smtp.connect(self.smtpserver)
        except Exception as exc:
            msg = 'Failed to connect to smtp server: %s.' % self.smtpserver
            LOG.error(msg)
        if self.smtpserver not in ["localhost", "127.0.0.1"] and\
                login_smtp_server:
            try:
                self.smtp.login(self.sender, self.password)
            except Exception as exc:
                msg = 'Failed to log into smtp server: %s.' % self.smtpserver
                LOG.error(msg)
        self.set_email_header(receiver, subject)
        self.set_email_body(cont)
        self.smtp.sendmail(self.sender, receiver, self.msg.as_string())
        msg = 'Successfully send the mail.'
        LOG.info(msg)
        self.smtp.quit()


@csrf_exempt
def sendemail(request):
    try:
        query = request.GET
        receiver = query.get('email')
        cont = json.loads(request.body)
    except Exception as e:
        return rest_utils.JSONResponse("Receiver or Content is None", 500)
    if receiver is None:
        return rest_utils.JSONResponse("Receiver or Content is None", 500)

    value_list = []
    for key in ['alarm_name', 'alarm_resource', 'alarm_meter',
                'alarm_description', 'previous', 'current', 'reason']:
        value = cont.get(key)
        if value:
            value_list.append(value)
        else:
            value_list.append('')

    subject = "Easystack Alarm Notification  (alarm name:%s)" % value_list[0]
    alarm_mail = """
    <html>
        <head></head>
        <body>
        <p>
        <b>Alarm Info</b><br>
        alarm_name: %s<br>
        alarm_resource: %s<br>
        alarm_meter: %s<br>
        alarm_description: %s<br>
        </p>
        <p>
        <b>Alarm State Transition</b><br>
         From '%s' To '%s'<br>
        <p>
        <b>Reason</b><br>
        %s<br>
        </p>
       </body>
    </html>""" % tuple(value_list)

    server = getattr(settings, 'SMTP_SERVER', 'smtp.ym.163.com')
    sender = getattr(settings, 'SENDER', 'noreply@easystack.cn')
    password = getattr(settings, 'SMTP_PW', None)
    email = Email(server, sender, password)
    email.send_email(receiver, subject, alarm_mail)
    return rest_utils.JSONResponse("Successfully send the mail", 202)
