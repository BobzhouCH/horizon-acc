from horizon import views


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/physical_servers/index.html'

class DetailView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/physical_servers/detail.html'

class DeleteServerView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/physical_servers/server/delete.html'

class AuthServerView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/physical_servers/server/auth.html'

class InterfaceConfigEditView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/physical_servers/interface_config.html'
class MonitorView(views.APIView):
    template_name = 'lenovo/physical_servers/monitor.html'
