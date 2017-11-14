from horizon import views


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/ha_management/index.html'


class EditHAView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/ha_management/edit-ha-form.html'
