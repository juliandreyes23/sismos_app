from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('sismos.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/login/', obtain_auth_token),

    re_path(
        r'^(?!api/|admin/|api-auth/|static/).*$', 
        TemplateView.as_view(template_name='index.html')
    ),
]