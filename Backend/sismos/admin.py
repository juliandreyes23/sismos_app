from django.contrib import admin
from .models import Sismo


@admin.register(Sismo)
class SismoAdmin(admin.ModelAdmin):
    list_display = (
        'id_usgs',
        'magnitud',
        'lugar',
        'fecha_hora',
        'profundidad_km',
        'tipo_magnitud',
        'tsunami',
    )

    search_fields = ('id_usgs', 'lugar')

    list_filter = ('tipo_magnitud', 'red', 'tsunami', 'alerta')

    ordering = ('-fecha_hora',)