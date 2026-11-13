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

        if(filtros.red) {
            parametros.red = filtros.red;
        }

        if(filtros.magnitud_gte !== ''){
            parametros.magnitud_gte = filtros.magnitud_gte;
        }

        if (filtros.anio) {
            parametros.fecha_hora_gte = `${filtros.anio}-01-01`;
            parametros.fecha_hora_lte = `${filtros.anio}-12-31`;
        }


        getStats(parametros)
            .then((respuesta) => {
                if(!cancelado) {
                    setDatos(respuesta);
                }
            })
            .catch((err) => {
                if(!cancelado){
                    setError(err.message);
                }
            })
            .finally(() =>{
                if(!cancelado){
                    setCargando(false);
                }
            });

            return () => {
                cancelado = true;
            };
    }, [filtros]);

    function cambiarFiltro(campo, valor){
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            [campo]: valor
        });
    }

    const globales = datos.globales || {};

    return (
        <div>
            <h1>Tablero de estadísticas</h1>

            <h3>Filtros de análisis</h3>

            <div>
                <select
                    value={filtros.anio}
                    onChange={(e) => cambiarFiltro('anio', e.target.value)} 
                >
                    <option value=''>Todos los años</option>
                    <option value='2023'>2023</option>
                    <option value='2024'>2024</option>
                    <option value='2025'>2025</option>
                    <option value='2026'>2026</option>
                </select>

                <select
                    value={filtros.red}
                    onChange={(e) => cambiarFiltro('red', e.target.value)} 
                >
                    <option value="">Todas las redes</option>
                    <option value="us">US</option>
                    <option value="ak">AK</option>
                    <option value="ci">CI</option>
                    <option value="nc">NC</option>
                </select>

                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Magnitud mínima"
                    value={filtros.magnitud_gte}
                    onChange={(e) => cambiarFiltro('magnitud_gte', e.target.value)}
                    />
            </div>

            {cargando && <p>Actualizando estadísticas...</p>}

            {error && <p>Error: {error}</p>}

            {!cargando && !error && (
                <>
                    <h2>Resumen general</h2>

                    <div>
                        <article>
                            <h3>Total de sismos</h3>
                            <p>{globales.total?.toLocaleString('es-CO') ?? 0}</p>
                        </article>

                        <article>
                            <h3>Magnitud promedio</h3>
                            <p>{Number(globales.magnitud_promedio ?? 0).toFixed(2)}</p>
                        </article>

                        <article>
                            <h3>Magnitud máxima</h3>
                            <p>{globales.magnitud_maxima == 0}</p>
                        </article>

                        <article>
                            <h3>Profundidad media</h3>
                            <p>{Number(globales.profundidad_media ?? 0).toFixed(2)}km</p>
                        </article>
                    </div>

                    <h2>Las 10 zonas más activas</h2>

                    <table border='1' cellPadding='8'>
                        <thead>
                            <tr>
                                <th>Zona</th>
                                <th>Total de sismos</th>
                                <th>Magnitud promedio</th>
                            </tr>
                        </thead>


                        <tbody>
                            {datos.por_zona.map((zona, index) => (
                                <tr key={index}>
                                    <td>{zona.lugar}</td>
                                    <td>{zona.total}</td>
                                    <td>{Number(zona.mag_prom ?? 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>Distribución por tipo y año</h2>

                    <table border="1" cellPadding="8">
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
                                        <td>{item.tipo_magnitud}</td>
                                        <td>{item.anio}</td>
                                        <td>{item.total}</td>
                                        <td>{item.mag_max}</td>
                                    </tr>
                                ))}
                            </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

export default Stats;