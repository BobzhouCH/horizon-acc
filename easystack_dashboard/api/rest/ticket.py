"""API over the cinder service.
"""

from django.conf import settings #noqa
from django.views import generic

from easystack_dashboard import api

from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.rest import urls
import time

@urls.register
class Tickets(generic.View):
    url_regex = r'tickets/tickets/$'

    @rest_utils.ajax()
    def get(self, request):
        v3, is_default_admin = api.keystone.is_default_domain_admin(request)
        requester_id = request.user.id
        status_id = request.GET.get('status_id', None)
        type_id = request.GET.get('type_id', None)
        all_projects =  request.GET.get('all_projects', None)

        if is_default_admin and all_projects == 'true':
            requester_id = None

        body = {'requester_id' : requester_id,
                'status_id' : status_id,
                'type_id' : type_id
                }

        for k in body.keys():
            if body[k] is None:
                del(body[k])

        tickets = api.ticket.ticket_list(request, **body)
        rest_utils.ensure_ticket_status_name(request, *tickets)
        rest_utils.ensure_ticket_type_name(request, *tickets)
        if is_default_admin and all_projects == 'true':
            rest_utils.ensure_ticket_user_name(request, *tickets)
            rest_utils.ensure_ticket_project_name(request, *tickets)
        else:
            for ticket in tickets:
                ticket['user_name'] = request.user.username
        return {'items': tickets}

    @rest_utils.ajax()
    def post(self, request):

        body = rest_utils.params_from_request(request)
        # title = request.DATA.get('title', None)
        # description = request.DATA.get('description', None)
        # type_id = request.DATA.get('type_id', None)
        requester_id = request.user.id
        requester_project_id = request.user.project_id
        status_id = rest_utils.get_ticket_status_name_id_map(request).get(rest_utils.ticket_type.open, None)

        body.update({'requester_id' : requester_id,
                     'requester_project_id' : requester_project_id,
                     'status_id' :status_id
                     })
        ticket = api.ticket.ticket_create(request, **body)

        rest_utils.ensure_ticket_status_name(request, ticket)
        rest_utils.ensure_ticket_type_name(request, ticket)
        ticket['user_name'] = request.user.username
        ticket['project_name'] = request.user.project_name
        return ticket

@urls.register
class Ticket(generic.View):
    url_regex = r'tickets/tickets/(?P<ticket_id>[0-9A-Za-z_-]+)/$'

    @rest_utils.ajax()
    def get(self, request, ticket_id):
        return api.ticket.ticket_get(request, ticket_id)

    @rest_utils.ajax()
    def delete(self, request, ticket_id):
        return api.ticket.ticket_delete(request, ticket_id)

    @rest_utils.ajax()
    def patch(self, request, ticket_id):
        # title = request.DATA.get('title', None)
        # description = request.DATA.get('description', None)
        # type_id = request.DATA.get('type_id', None)
        # status_id = request.DATA.get('status_id', None)

        return api.ticket.ticket_update(request, ticket_id, **request.DATA)


@urls.register
class Types(generic.View):
    url_regex = r'tickets/types/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': api.ticket.type_list(request)}


@urls.register
class Attachments(generic.View):
    url_regex = r'tickets/attachments/$'

    @rest_utils.ajax()
    def post(self, request):
        return api.ticket.attachment_create(request, **request.DATA)


@urls.register
class Attachment(generic.View):
    url_regex = r'tickets/attachments/(?P<ticket_id>[0-9A-Za-z_]+)/(?P<attachment_id>[0-9A-Za-z_]+)/$'

    @rest_utils.ajax()
    def get(self, request, ticket_id, attachment_id):
        return api.ticket.attachment_get(request, ticket_id, attachment_id)


@urls.register
class Replies(generic.View):
    url_regex = r'tickets/replies/$'

    @rest_utils.ajax()
    def post(self, request):
        ticket_id = request.DATA.get('ticket_id', None)
        content = request.DATA.get('content', None)
        author_id = request.user.id
        body = {'content' : content,
                'author_id' : author_id
                }
        reply = api.ticket.reply_create(request,  ticket_id, **body)
        reply['author_name'] = request.user.username
        return reply


@urls.register
class TicketReplies(generic.View):
    url_regex = r'tickets/tickets/(?P<ticket_id>.+)/replies/$'

    def _reply_comp_fun(self, reply):
        created_at = reply.get('created_at', None)
        if created_at is None:
            return -1
        try:
            second = int(time.mktime(time.strptime(created_at, '%Y-%m-%d %H:%M:%S')))
        except:
            return -1
        return second

    @rest_utils.ajax()
    def get(self, request, ticket_id):

        body = {'ticket_id' : ticket_id}
        replies = api.ticket.reply_get_by_ticket_id(request, **body)

        v3, is_default_admin = api.keystone.is_default_domain_admin(request)
        user_id = request.user.id
        user_name = request.user.username
        if is_default_admin:
            rest_utils.ensure_reply_user_name(request, *replies)
        else:
            for reply in replies:
                if reply.get('author_id', None) == user_id:
                    reply['author_name'] = user_name
                else:
                    reply['author_name'] = 'admin'

        replies.sort(key = self._reply_comp_fun)
        return {'items': replies}


@urls.register
class Status(generic.View):
    url_regex = r'tickets/statuses/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': api.ticket.status_list(request)}
