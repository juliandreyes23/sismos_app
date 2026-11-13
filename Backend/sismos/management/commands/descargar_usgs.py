from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand, CommandError

from sismos.fuente_usgs import consultar_sismos
from sismos.models import Sismo


class Command(BaseCommand):
    help = (
        'Descarga sismos reales del dataset de USGS y los guarda '
        'en la base con bulk_create. Es idempotente.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--start',
            default='2020-01-01',
            help='Fecha de inicio ISO (default: 2020-01-01).',
        )
        parser.add_argument(
            '--end',
            default='2024-12-31',
            help='Fecha de fin ISO (default: 2024-12-31).',
        )
        parser.add_argument(
            '--minmag',
            type=float,
            default=4.5,
            help='Magnitud mínima (default: 4.5).',
        )

    def handle(self, *args, **options):
        starttime = options['start']
        endtime = options['end']
        minmagnitude = options['minmag']

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'Consultando USGS: {starttime} → {endtime} · magnitud >= {minmagnitude}'
        ))

        start_year = int(starttime[:4])
        end_year = int(endtime[:4])

        todas_las_features = []
        for anio in range(start_year, end_year + 1):
            inicio_anio = f'{anio}-01-01'
            fin_anio = f'{anio}-12-31'
            self.stdout.write(f'  · Descargando año {anio}...', ending=' ')
            try:
                features = consultar_sismos(inicio_anio, fin_anio, minmagnitude)
                self.stdout.write(f'{len(features):,} sismos')
                todas_las_features.extend(features)
            except Exception as error:
                self.stdout.write(self.style.ERROR(f'ERROR: {error}'))

        features = todas_las_features
        recibidos = len(features)
        self.stdout.write(f'\nTotal sismos recibidos desde USGS: {recibidos:,}')

        if recibidos == 0:
            self.stdout.write(self.style.WARNING('No se recibieron sismos.'))
            return

        ids_existentes = set(
            Sismo.objects.values_list('id_usgs', flat=True)
        )

        nuevos = []
        omitidos = 0

        for feature in features:
            sismo = feature_a_sismo(feature)
            if sismo is None:
                omitidos += 1  
                continue
            if sismo.id_usgs in ids_existentes:
                omitidos += 1 
                continue

            nuevos.append(sismo)
            ids_existentes.add(sismo.id_usgs)  

        inicio = datetime.now(timezone.utc)
        if nuevos:
            Sismo.objects.bulk_create(
                nuevos,
                batch_size=1000,
                ignore_conflicts=True,
            )
        duracion_ms = int((datetime.now(timezone.utc) - inicio).total_seconds() * 1000)

        total_en_bd = Sismo.objects.count()
        por_segundo = round(len(nuevos) / (duracion_ms / 1000), 2) if duracion_ms else 0

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Informe de carga ==='))
        self.stdout.write(f'Sismos recibidos desde USGS : {recibidos:,}')
        self.stdout.write(f'Sismos nuevos guardados     : {len(nuevos):,}')
        self.stdout.write(f'Sismos omitidos (duplicados): {omitidos:,}')
        self.stdout.write(f'Total de sismos en BD       : {total_en_bd:,}')
        self.stdout.write(f'Tiempo de inserción (ms)    : {duracion_ms:,}')
        self.stdout.write(f'Velocidad (sismos/seg)      : {por_segundo:,}')
        self.stdout.write(self.style.SUCCESS('=== Carga completada ==='))


def feature_a_sismo(feature):
    """Convierte una feature GeoJSON de USGS en un objeto Sismo.

    Devuelve None si la fila es inválida (campos críticos nulos o
    mal formateados).
    """
    props = feature.get('properties') or {}
    geometry = feature.get('geometry') or {}
    coordinates = geometry.get('coordinates') or []

    id_usgs = str(feature.get('id') or '').strip()
    if not id_usgs or len(id_usgs) > 30:
        return None

    if len(coordinates) < 3:
        return None
    try:
        longitud = Decimal(str(coordinates[0])).quantize(Decimal('0.000001'))
        latitud = Decimal(str(coordinates[1])).quantize(Decimal('0.000001'))
        profundidad_km = Decimal(str(coordinates[2])).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError, ValueError):
        return None

    try:
        magnitud = Decimal(str(props.get('mag'))).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError, ValueError):
        magnitud = None

    try:
        ts_ms = int(props.get('time'))
        fecha_hora = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
    except (TypeError, ValueError, OSError):
        return None

    lugar = str(props.get('place') or '').strip()[:255]
    tipo_magnitud = str(props.get('magType') or '').strip()[:10] or 'desconocido'
    tipo_evento = str(props.get('type') or 'earthquake').strip()[:20]
    red = str(props.get('net') or '').strip()[:10] or 'unknown'
    estado = str(props.get('status') or '').strip()[:20] or 'automatic'
    alerta = str(props.get('alert') or '').strip()[:10]  
    tsunami = bool(props.get('tsunami', 0))
    significancia = int(props.get('sig') or 0)
    url_usgs = str(props.get('url') or '').strip()[:255]

    return Sismo(
        id_usgs=id_usgs,
        magnitud=magnitud,
        profundidad_km=profundidad_km,
        latitud=latitud,
        longitud=longitud,
        lugar=lugar,
        fecha_hora=fecha_hora,
        tipo_magnitud=tipo_magnitud,
        tipo_evento=tipo_evento,
        red=red,
        estado=estado,
        alerta=alerta,
        tsunami=tsunami,
        significancia=significancia,
        url_usgs=url_usgs,
    )