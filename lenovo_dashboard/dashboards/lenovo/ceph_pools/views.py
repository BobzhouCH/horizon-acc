from horizon import views


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'lenovo/ceph_pools/index.html'

# class DetailView(views.APIView):
#     # A very simple class-based view...
#     template_name = 'lenovo/physical_servers/detail.html'
#
# class DeleteServerView(views.APIView):
#     # A very simple class-based view...
#     template_name = 'lenovo/physical_servers/server/delete.html'
#
# class AuthServerView(views.APIView):
#     # A very simple class-based view...
#     template_name = 'lenovo/physical_servers/server/auth.html'
