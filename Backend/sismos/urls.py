
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SismoViewSet, stats, sincronizar

router = DefaultRouter()
router.register('sismos', SismoViewSet, basename='sismo')

urlpatterns = [
    path('sismos/stats/', stats, name='sismos-stats'),
    path('sismos/sincronizar/', sincronizar, name='sismos-sincronizar'),
    path('', include(router.urls)),
]
