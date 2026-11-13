from rest_framework import serializers
from .models import Sismo

class SismoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sismo
        fields = ['id', 'id_usgs', 'magnitud', 'profundidad_km', 'latitud', 'longitud', 'lugar',
              'fecha_hora', 'tipo_magnitud', 'tipo_evento', 'red', 'estado', 'alerta', 'tsunami',
              'significancia', 'url_usgs']
