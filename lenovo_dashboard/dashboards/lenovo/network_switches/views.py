from horizon import views


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/index.html'

class DetailView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/detail.html'

class CreateSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/switch/create.html'

class EditSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/switch/edit.html'

class DeleteSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/switch/delete.html'

class CreateDetailSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/detail/create.html'

class EditDetailSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/detail/edit.html'

class DeleteDetailSwitchView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/network_switches/detail/delete.html'