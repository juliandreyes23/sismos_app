
import { useEffect, useState } from "react";
import { getStats } from "../../services/api";


function Stats() {
    const [filtros, setFiltros] = useState({
        anio: '',
        red: '',
        magnitud_gte: ''
    });

    const [datos, setDatos] = useState({
        globales: {},
        por_zonas: [],
        por_tipo_y_anio: []
    });

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelado = false;

        const parametros = {};

        if (filtros.red) {
            parametros.red = filtros.red;
        }

        if (filtros.magnitud_gte !== '') {
            parametros.magnitud_gte = filtros.magnitud_gte;
        }

        if (filtros.anio) {
            parametros.fecha_hora_gte = `${filtros.anio}-01-01`;
            parametros.fecha_hora_lte = `${filtros.anio}-12-31`;
        }


        getStats(parametros)
            .then((respuesta) => {
                if (!cancelado) {
                    setDatos(respuesta);
                    setError('');
                }
            })
            .catch((err) => {
                if (!cancelado) {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (!cancelado) {
                    setCargando(false);
                }
            });

        return () => {
            cancelado = true;
        };
    }, [filtros]);

    function cambiarFiltro(campo, valor) {
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            [campo]: valor
        });
    }

    const globales = datos.globales || {};
    const porZonas = datos.por_zonas ?? datos.por_zona ?? [];

    return (
        <div className="vista">
            <h1>Tablero de estadísticas</h1>
            <p className="subtitulo">
                Analiza la actividad sísmica con resúmenes generales,
                zonas más activas y distribución temporal.
            </p>

            <div className="filtros">
                <div className="campo">
                    <label htmlFor="anio">Año</label>
                    <select
                        id="anio"
                        value={filtros.anio}
                        onChange={(e) => cambiarFiltro('anio', e.target.value)}
                    >
                        <option value="">Todos los años</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="red">Red sísmica</label>
                    <select
                        id="red"
                        value={filtros.red}
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
                    <label htmlFor="mag-min">Magnitud mínima</label>
                    <input
                        id="mag-min"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="Ej: 5.5"
                        value={filtros.magnitud_gte}
                        onChange={(e) => cambiarFiltro('magnitud_gte', e.target.value)}
                    />
                </div>
            </div>

            {cargando && <p className="estado">Actualizando estadísticas...</p>}

            {error && (
                <p className="aviso aviso-error espaciador">
                    No se pudieron cargar las estadísticas: {error}
                </p>
            )}

            {!cargando && !error && (
                <>
                    <h2>Resumen general</h2>

                    <div className="tarjetas-datos">
                        <article className="tarjeta-dato">
                            <h3>Total de sismos</h3>
                            <p>{globales.total?.toLocaleString('es-CO') ?? 0}</p>
                        </article>

                        <article className="tarjeta-dato">
                            <h3>Magnitud promedio</h3>
                            <p>{Number(globales.magnitud_promedio ?? 0).toFixed(2)}</p>
                        </article>

                        <article className="tarjeta-dato">
                            <h3>Magnitud máxima</h3>
                            <p>{Number(globales.magnitud_maxima ?? 0).toFixed(1)}</p>
                        </article>

                        <article className="tarjeta-dato">
                            <h3>Profundidad media</h3>
                            <p>
                                {Number(globales.profundidad_media ?? 0).toFixed(2)}
                                <span style={{ fontSize: '15px', marginLeft: 4 }}>km</span>
                            </p>
                        </article>
                    </div>

                    <h2>Las 10 zonas más activas</h2>

                    <div className="envoltura-tabla espaciador">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Zona</th>
                                    <th>Total de sismos</th>
                                    <th>Magnitud promedio</th>
                                </tr>
                            </thead>

                            <tbody>
                                {porZonas.map((zona, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="resaltado">{zona.lugar}</td>
                                        <td>{zona.total?.toLocaleString('es-CO')}</td>
                                        <td>{Number(zona.mag_prom ?? 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 className="espaciador">Distribución por tipo y año</h2>

                    <div className="envoltura-tabla espaciador">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo de magnitud</th>
                                    <th>Año</th>
                                    <th>Total de sismos</th>
                                    <th>Magnitud máxima</th>
                                </tr>
                            </thead>

                            <tbody>
                                {datos.por_tipo_y_anio.map((item, index) => (
                                    <tr key={index}>
                                        <td className="resaltado">
                                            {item.tipo_magnitud?.toUpperCase()}
                                        </td>
                                        <td>{item.anio}</td>
                                        <td>{item.total?.toLocaleString('es-CO')}</td>
                                        <td>{Number(item.mag_max ?? 0).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default Stats;
