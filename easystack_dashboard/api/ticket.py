from __future__ import absolute_import

import logging

from django.conf import settings

if getattr(settings, 'TICKET_ENABLED', False):
    from ticketsclient.client import client as ticket_client
else:
    def ticket_client():
        pass

from horizon import exceptions
from horizon.utils.memoized import memoized

from easystack_dashboard.api import base

LOG = logging.getLogger(__name__)


@memoized
def ticketclient(request):
    try:
        client = ticket_client.Client(ticket_url=base.url_for(request, 'ticket'),
                                      auth_token=request.user.token.id)
    except exceptions.ServiceCatalogException:
        LOG.debug('No Ticket service is configured.')

    return client


def ticket_create(request, **kwargs):
    ticket =  ticketclient(request).tickets.create(**kwargs)

    return ticket.to_dict()


def ticket_delete(request, ticket_id):
    ticketclient(request).tickets.delete(ticket_id)


def ticket_list(request, **kwargs):
    tickets = ticketclient(request).tickets.list(**kwargs)

    return tickets.to_dict().get('tickets')

def ticket_get(request, ticket_id):
    return ticketclient(request).tickets.get(ticket_id)


def ticket_update(request, ticket_id, **kwargs):
    return ticketclient(request).tickets.update(ticket_id, **kwargs).to_dict()


def type_list(request, **kwargs):
    return ticketclient(request).types.list(**kwargs).to_dict().get('types')


def attachment_create(request, **kwargs):
    return ticketclient(request).attachments.create(**kwargs)


def attachment_get(request, ticket_id, attachment_id):
    return ticketclient(request).attachments.get(ticket_id, attachment_id)


def reply_create(request,  ticket_id, **kwargs):
    return ticketclient(request).replies.create(ticket_id, **kwargs).to_dict()


def reply_get_by_ticket_id(request, **kwargs):
    replies = ticketclient(request).replies.list(**kwargs).to_dict()
    return replies.get('replies')


def status_list(request, **kwargs):
    return ticketclient(request).statuses.list(**kwargs).to_dict().get('statuses')
