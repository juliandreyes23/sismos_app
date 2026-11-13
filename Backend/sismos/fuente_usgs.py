"""Cliente para consumir el endpoint query de USGS (FDSN Web Service).

Devuelve una lista de features GeoJSON con sismos reales filtrados por
fecha de inicio, fecha de fin y magnitud mínima.
"""

import requests

URL_QUERY = 'https://earthquake.usgs.gov/fdsnws/event/1/query'


def consultar_sismos(starttime, endtime, minmagnitude=4.5, timeout=60):
    """Llama a la API de USGS y devuelve la lista de features GeoJSON.

    Parámetros:
        starttime: str con fecha ISO (ej: '2020-01-01')
        endtime:   str con fecha ISO (ej: '2024-12-31')
        minmagnitude: float, magnitud mínima (default 4.5)
        timeout: int, segundos máximos de espera

    Retorna:
        list[dict] con las features GeoJSON.
    """
    parametros = {
        'format': 'geojson',
        'starttime': starttime,
        'endtime': endtime,
        'minmagnitude': minmagnitude,
        'orderby': 'time-asc', 
    }

    respuesta = requests.get(URL_QUERY, params=parametros, timeout=timeout)
    respuesta.raise_for_status()  

    datos = respuesta.json()
    features = datos.get('features', [])

    if not isinstance(features, list):
        raise ValueError('USGS no devolvió una lista de features.')

    return features