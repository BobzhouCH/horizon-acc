"""API for Settings"""

from datetime import datetime  # noqa
from datetime import timedelta  # noqa
from django.conf import settings
from django import shortcuts
from django.views import generic
from django.utils import translation

from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard.api.notice import notice


def _one_year():
    return datetime.now() + timedelta(days=365)


@urls.register
class Language(generic.View):
    url_regex = r'language/$'

    @rest_utils.ajax()
    def get(self, request):
        lang = translation.get_language_from_request(request)
        return lang

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        body = request.DATA
        lang_code = body.get('lang')
        response = shortcuts.redirect(request.build_absolute_uri())
        if lang_code and translation.check_for_language(lang_code):
            if hasattr(request, 'session'):
                request.session['django_language'] = lang_code
            response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code,
                                expires=_one_year())
        return response


@urls.register
class Notice(generic.View):
    url_regex = r'notice/$'

    @rest_utils.ajax()
    def get(self, request):
        items = notice.get_notice()
        return items

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        return notice.update_notice(request.DATA)
