from django.db.models import Avg, Min, Max, Count, Sum
from django.db.models.functions import ExtractYear

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Sismo
from .serializers import SismoSerializer

from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta

from .fuente_usgs import consultar_sismos
from .management.commands.descargar_usgs import feature_a_sismo

class SismoViewSet(viewsets.ModelViewSet):
    queryset = Sismo.objects.all()
    serializer_class = SismoSerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]

    search_fields = ['id_usgs', 'lugar']

    ordering_fields = ['fecha_hora', 'magnitud', 'profundidad_km', 'significancia']
    ordering = ['-fecha_hora']
    filterset_fields = {
        'tipo_magnitud': ['exact'],
        'red': ['exact'],
        'tsunami': ['exact'],
        'magnitud': ['gte', 'lte'],
        'profundidad_km': ['gte', 'lte'],
        'fecha_hora': ['gte', 'lte'],
    }


def _queryset_filtrado(request):
    vista = SismoViewSet()
    vista.request = request

    return vista.filter_queryset(Sismo.objects.all())

@api_view(['GET'])
def stats(request):
    qs = _queryset_filtrado(request)

    globales = qs.aggregate(
        total=Count('id'),
        magnitud_promedio=Avg('magnitud'),
        magnitud_maxima=Max('magnitud'),
        profundidad_media=Avg('profundidad_km'),
        significancia_total=Sum('significancia'),
    )

    por_zona = (
        qs.values('lugar')
        .annotate(
            total=Count('id'),
            mag_prom=Avg('magnitud')
        )
        .order_by('-total')[:10]
    )

    por_tipo_y_anio = (
        qs.values(
            'tipo_magnitud',
            anio=ExtractYear('fecha_hora')
        )
        .annotate(
            total=Count('id'),
            mag_max=Max('magnitud')
        )
        .order_by('anio', '-total')
    )

    return Response({
        'globales': globales,
        'por_zona': por_zona,
        'por_tipo_y_anio': list(por_tipo_y_anio),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sincronizar(request):
    ayer = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    hoy = datetime.utcnow().strftime('%Y-%m-%d')
    features = consultar_sismos(ayer, hoy, minmagnitude=2.5)

    ids_existentes = set(Sismo.objects.values_list('id_usgs', flat=True))
    nuevos = [s for f in features
              if (s := feature_a_sismo(f))
              and s.id_usgs not in ids_existentes]
    if nuevos:
        Sismo.objects.bulk_create(nuevos, ignore_conflicts=True)

    return Response({'sincronizados': len(nuevos),
                     'usuario': request.user.username})
