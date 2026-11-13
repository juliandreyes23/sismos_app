import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { getSismos } from "../../services/api";

function colorPorMagnitud(magnitud) {
    if (magnitud >= 7) return '#b91c1c';
    if (magnitud >= 6) return '#c2410c';
    if (magnitud >= 5) return '#b45309';
    return '#0e7490';
}

function MapaSismos({ filtros }) {
    const [sismos, setSismos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelado = false;

        async function cargarSismos() {
            setCargando(true);
            setError('');

            try {
                const parametros = {};

                if (filtros?.red) {
                    parametros.red = filtros.red;
                }

                if (filtros?.magnitud__gte) {
                    parametros.magnitud__gte = filtros.magnitud__gte;
                }

                if (filtros?.anio) {
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

                const paginaRestantes = await Promise.all(
                    Array.from(
                        { length: totalPaginas - 1 },
                        (_, i) => getSismos({
                            ...parametros,
                            page: i + 2
                        })
                    )
                );

                const todosLosSismos = [
                    ...primeraPagina.results,
                    ...paginaRestantes.flatMap(pagina => pagina.results)
                ];

                if (!cancelado) {
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

    if (cargando) {
        return <p>Cargando sismos en el mapa...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <section>
            <h2>Mapa mundial de sismos</h2>

            <p>{sismos.length} sismos representados en el mapa</p>

            <MapContainer
                center={[10, -70]}
                zoom={2}
                style={{ height: '480px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
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

            <div>
                <p>🔵 Menor a 5.0</p>
                <p>🟡 De 5.0 a 5.9</p>
                <p>🟠 De 6.0 a 6.9</p>
                <p>🔴 7.0 o superior</p>
            </div>
        </section>
    );
}

export default MapaSismos;