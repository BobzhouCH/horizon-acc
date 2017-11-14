from horizon import views


class AboutView(views.APIView):
    # A very simple class-based view...
    template_name = 'thinkcloud/help/about.html'

    def get_data(self, request, context, *args, **kwargs):
        # Add data to the context here...
        return context


class SupportView(views.APIView):
    # A very simple class-based view...
    template_name = 'thinkcloud/help/support.html'

    def get_data(self, request, context, *args, **kwargs):
        # Add data to the context here...
        return context
