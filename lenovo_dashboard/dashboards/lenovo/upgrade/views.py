from horizon import views


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/upgrade/index.html'


class UpgradeStartView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/upgrade/upgrade/start.html'
