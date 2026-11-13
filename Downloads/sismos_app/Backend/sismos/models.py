from django.db import models


class Sismo(models.Model):
    # Identificador único que entrega USGS (ej: "us7000ct5r").
    # unique=True evita duplicados si el comando de carga se ejecuta varias veces.
    id_usgs = models.CharField(max_length=30, unique=True)

    # Medición numérica: DecimalField y NO FloatField.
    # max_digits=4 y decimal_places=2 permite valores de 0.00 a 99.99.
    magnitud = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )

    # Profundidad en kilómetros. Profundidades van de 0 a ~700 km.
    # max_digits=6 y decimal_places=2 permite hasta 9999.99 km.
    profundidad_km = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )

    # Latitud y longitud. DecimalField da precisión de 6 decimales
    # (~10 cm en el ecuador), suficiente para ubicar un sismo en el mapa.
    latitud = models.DecimalField(
        max_digits=9, decimal_places=6
    )
    longitud = models.DecimalField(
        max_digits=9, decimal_places=6
    )

    # Texto descriptivo del lugar donde se sintió.
    lugar = models.CharField(max_length=255)

    # Fecha y hora del sismo. USGS la entrega como timestamp en milisegundos.
    fecha_hora = models.DateTimeField()

    # Categorías: CharField corto con choices implícitos en los datos.
    tipo_magnitud = models.CharField(max_length=10)   # ml, md, mww, mb, mw...
    tipo_evento = models.CharField(max_length=20)     # earthquake, explosion...
    red = models.CharField(max_length=10)             # us, ak, nc, ci...
    estado = models.CharField(max_length=20)          # reviewed, automatic

    # Alerta de color: puede venir null en USGS.
    alerta = models.CharField(max_length=10, blank=True)  # green, yellow, orange, red

    # Booleano: ¿generó tsunami? (en USGS viene como 0/1)
    tsunami = models.BooleanField(default=False)

    # Significancia: entero calculado por USGS (impacto combinado).
    significancia = models.IntegerField(default=0)

    # URL del detalle en USGS.
    url_usgs = models.URLField(max_length=255)

    class Meta:
        ordering = ['-fecha_hora']  # los más recientes primero por defecto
        indexes = [
            models.Index(fields=['fecha_hora']),         # filtra por rango de fechas
            models.Index(fields=['magnitud']),           # ordena por magnitud
            models.Index(fields=['red']),                # agrupa por red
            models.Index(fields=['tipo_magnitud']),      # agrupa por tipo_magnitud
        ]

    def __str__(self):
        return f'{self.id_usgs} · M{self.magnitud} · {self.lugar}'