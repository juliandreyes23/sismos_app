
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { getSismos } from "../../services/api";

const ANIO_MINIMO = 2023;

const FILTROS_INICIALES = {
    search: '',
    anio: '',
    red: '',
    magnitud__gte: ''
};

function colorPorMagnitud(magnitud) {
    if (magnitud >= 7) return '#ef4444';
    if (magnitud >= 6) return '#f97316';
    if (magnitud >= 5) return '#f59e0b';
    return '#0ea5e9';
}

function MapaSismos() {
    // Filtros aplicados: son los que se envían a la API.
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);

    // Borrador: lo que el usuario escribe en los campos.
    const [entrada, setEntrada] = useState(FILTROS_INICIALES);

    const [sismos, setSismos] = useState([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // El lugar y la magnitud se aplican con un pequeño retardo para
    // no consultar la API en cada tecla.
    useEffect(() => {
        const temporizador = setTimeout(() => {
            setFiltros(prev => (
                JSON.stringify(prev) === JSON.stringify(entrada)
                    ? prev
                    : entrada
            ));
        }, 350);

        return () => clearTimeout(temporizador);
    }, [entrada]);

    useEffect(() => {
        let cancelado = false;

        async function cargarSismos() {
            setCargando(true);
            setError('');

            try {
                const parametros = {};

                if (filtros.search) {
                    parametros.search = filtros.search;
                }

                if (filtros.red) {
                    parametros.red = filtros.red;
                }

                if (filtros.magnitud__gte !== '') {
                    parametros.magnitud__gte = filtros.magnitud__gte;
                }

                if (filtros.anio) {
                    parametros.fecha_hora__gte = `${filtros.anio}-01-01`;
                    parametros.fecha_hora__lte = `${filtros.anio}-12-31T23:59:59`;
                }

                const primeraPagina = await getSismos({
                    ...parametros,
                    page: 1
                });

                const totalPaginas = Math.min(
                    Math.ceil(primeraPagina.count / 50),
                    20
                );

                const paginasRestantes = await Promise.all(
                    Array.from(
                        { length: Math.max(0, totalPaginas - 1) },
                        (_, i) => getSismos({
                            ...parametros,
                            page: i + 2
                        })
                    )
                );

                const todosLosSismos = [
                    ...primeraPagina.results,
                    ...paginasRestantes.flatMap(pagina => pagina.results)
                ];

                if (!cancelado) {
                    setTotal(primeraPagina.count);
                    setSismos(todosLosSismos);
                }
            } catch (err) {
                if (!cancelado) {
                    setError(err.message);
                }
            } finally {
                if (!cancelado) {
                    setCargando(false);
                }
            }
        }

        cargarSismos();

        return () => {
            cancelado = true;
        };
    }, [filtros]);

    function cambiarFiltro(campo, valor) {
        setEntrada(prev => ({ ...prev, [campo]: valor }));
    }

    function limpiarFiltros() {
        setEntrada(FILTROS_INICIALES);
        setFiltros(FILTROS_INICIALES);
    }

    const hayFiltrosActivos = Object.values(entrada).some(valor => valor !== '');

    const anios = [];
    for (let anio = new Date().getFullYear(); anio >= ANIO_MINIMO; anio--) {
        anios.push(anio);
    }

    const mostrarMapa = sismos.length > 0 || (!cargando && !error);

    return (
        <div className="vista">
            <h1>Mapa mundial de sismos</h1>
            <p className="subtitulo">
                Explora los eventos sobre el mapa y usa los filtros para
                enfocarte en un lugar, año, red sísmica o magnitud concreta.
            </p>

            <div className="filtros">
                <div className="campo" style={{ flex: 2 }}>
                    <label htmlFor="mapa-buscar">Lugar</label>
                    <input
                        id="mapa-buscar"
                        type="text"
                        placeholder="Ej: Alaska, Chile, Japón..."
                        value={entrada.search}
                        onChange={(e) => cambiarFiltro('search', e.target.value)}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="mapa-anio">Año</label>
                    <select
                        id="mapa-anio"
                        value={entrada.anio}
                        onChange={(e) => cambiarFiltro('anio', e.target.value)}
                    >
                        <option value="">Todos los años</option>
                        {anios.map(anio => (
                            <option key={anio} value={anio}>{anio}</option>
                        ))}
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="mapa-red">Red sísmica</label>
                    <select
                        id="mapa-red"
                        value={entrada.red}
                        onChange={(e) => cambiarFiltro('red', e.target.value)}
                    >
                        <option value="">Todas las redes</option>
                        <option value="us">US</option>
                        <option value="ak">AK</option>
                        <option value="ci">CI</option>
                        <option value="nc">NC</option>
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="mapa-mag">Magnitud mínima</label>
                    <input
                        id="mapa-mag"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="Ej: 5.5"
                        value={entrada.magnitud__gte}
                        onChange={(e) => cambiarFiltro('magnitud__gte', e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="btn"
                    onClick={limpiarFiltros}
                    disabled={!hayFiltrosActivos}
                >
                    Limpiar filtros
                </button>
            </div>

            {cargando && sismos.length === 0 && (
                <p className="estado">Cargando sismos en el mapa...</p>
            )}

            {error && (
                <p className="aviso aviso-error">
                    No se pudo cargar el mapa: {error}
                </p>
            )}

            {mostrarMapa && (
                <>
                    {cargando && (
                        <p className="aviso aviso-info">
                            Actualizando el mapa con los filtros aplicados...
                        </p>
                    )}

                    <MapContainer
                        center={[10, -70]}
                        zoom={2}
                        style={{ height: '480px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri, Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                        />

                        {sismos.map(sismo => {
                            const latitud = Number(sismo.latitud);
                            const longitud = Number(sismo.longitud);
                            const magnitud = Number(sismo.magnitud);

                            if (
                                !Number.isFinite(latitud) ||
                                !Number.isFinite(longitud) ||
                                !Number.isFinite(magnitud) ||
                                latitud < -90 ||
                                latitud > 90 ||
                                longitud < -180 ||
                                longitud > 180
                            ) {
                                return null;
                            }

                            return (
                                <CircleMarker
                                    key={sismo.id}
                                    center={[latitud, longitud]}
                                    radius={Math.max(4, magnitud * 2.2)}
                                    pathOptions={{
                                        color: colorPorMagnitud(magnitud),
                                        fillColor: colorPorMagnitud(magnitud),
                                        fillOpacity: 0.55
                                    }}
                                >
                                    <Popup>
                                        <strong>{sismo.lugar}</strong>
                                        <br />
                                        Magnitud: {magnitud}
                                        <br />
                                        Profundidad: {sismo.profundidad_km} km
                                        <br />
                                        Fecha: {sismo.fecha_hora}
                                        <br />
                                        Red: {sismo.red}
                                        <br />
                                        ID: {sismo.id_usgs}
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>

                    <p className="subtitulo" style={{ margin: '16px 0 0' }}>
                        {total > sismos.length
                            ? `${sismos.length.toLocaleString('es-CO')} de ${total.toLocaleString('es-CO')} sismos representados · por rendimiento se muestran los más recientes`
                            : `${sismos.length.toLocaleString('es-CO')} sismos representados · el tamaño del círculo indica la magnitud`}
                    </p>

                    <div className="leyenda-mapa">
                        <p>
                            <span className="chip" style={{ background: '#0ea5e9' }} />
                            Menor a 5.0
                        </p>
                        <p>
                            <span className="chip" style={{ background: '#f59e0b' }} />
                            De 5.0 a 5.9
                        </p>
                        <p>
                            <span className="chip" style={{ background: '#f97316' }} />
                            De 6.0 a 6.9
                        </p>
                        <p>
                            <span className="chip" style={{ background: '#ef4444' }} />
                            7.0 o superior
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

export default MapaSismos;
