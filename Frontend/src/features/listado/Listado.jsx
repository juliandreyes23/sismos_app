
import { useEffect, useState } from 'react';
import { getSismos } from '../../services/api';

function claseMagnitud(magnitud) {
    if (magnitud >= 7) return 'mag-critica';
    if (magnitud >= 6) return 'mag-alta';
    if (magnitud >= 5) return 'mag-media';
    return 'mag-baja';
}

function Listado({ actualizar }) {
    const [filtros, setFiltros] = useState({
        page: 1,
        search: '',
        ordering: '-fecha_hora',
        tipo_magnitud: '',
        red: '',
        magnitud__gte: ''
    });

    const [datos, setDatos] = useState({
        count: 0,
        next: null,
        previous: null,
        results: []
    });

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        getSismos(filtros)
            .then((respuesta) => {
                if (activo) {
                    setDatos(respuesta);
                    setError('');
                }
            })
            .catch((error) => {
                if (activo) {
                    setError(error.message);
                }
            })
            .finally(() => {
                if (activo) {
                    setCargando(false);
                }
            });

        return () => {
            activo = false;
        };

    }, [filtros, actualizar]);

    function cambiarFiltro(campo, valor) {
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            [campo]: valor,
            page: 1
        });
    }

    function cambiarPagina(numero) {
        setCargando(true);
        setError('');

        setFiltros({
            ...filtros,
            page: numero
        });
    }

    return (
        <div className="vista">
            <h1>Listado de sismos</h1>
            <p className="subtitulo">
                {datos.count.toLocaleString('es-CO')} sismos encontrados ·
                Fuente: USGS
            </p>

            <div className="filtros">
                <div className="campo" style={{ flex: 2 }}>
                    <label htmlFor="buscar">Buscar</label>
                    <input
                        id="buscar"
                        type="text"
                        placeholder="Buscar por lugar..."
                        value={filtros.search}
                        onChange={(e) => cambiarFiltro('search', e.target.value)}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="orden">Ordenar por</label>
                    <select
                        id="orden"
                        value={filtros.ordering}
                        onChange={(e) => cambiarFiltro('ordering', e.target.value)}
                    >
                        <option value="-fecha_hora">Más recientes</option>
                        <option value="fecha_hora">Más antiguos</option>
                        <option value="-magnitud">Mayor magnitud</option>
                        <option value="magnitud">Menor magnitud</option>
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="tipo">Tipo de magnitud</label>
                    <select
                        id="tipo"
                        value={filtros.tipo_magnitud}
                        onChange={(e) => cambiarFiltro('tipo_magnitud', e.target.value)}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="mw">MW</option>
                        <option value="mb">MB</option>
                        <option value="ml">ML</option>
                        <option value="md">MD</option>
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
                        value={filtros.magnitud__gte}
                        onChange={(e) => cambiarFiltro('magnitud__gte', e.target.value)}
                    />
                </div>
            </div>

            {cargando && <p className="estado">Cargando sismos...</p>}

            {error && (
                <p className="aviso aviso-error espaciador">
                    No se pudo cargar el listado: {error}
                </p>
            )}

            {!cargando && !error && (
                <div className="envoltura-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>ID USGS</th>
                                <th>Magnitud</th>
                                <th>Lugar</th>
                                <th>Profundidad</th>
                                <th>Fecha</th>
                                <th>Red</th>
                            </tr>
                        </thead>

                        <tbody>
                            {datos.results.map((sismo) => (
                                <tr key={sismo.id}>
                                    <td>{sismo.id_usgs}</td>
                                    <td>
                                        <span className={`mag-etiqueta ${claseMagnitud(Number(sismo.magnitud))}`}>
                                            {sismo.magnitud}
                                        </span>
                                    </td>
                                    <td className="resaltado">{sismo.lugar}</td>
                                    <td>{sismo.profundidad_km} km</td>
                                    <td>{sismo.fecha_hora}</td>
                                    <td>{sismo.red?.toUpperCase()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="paginacion">
                <button
                    className="btn"
                    disabled={!datos.previous || cargando}
                    onClick={() => cambiarPagina(filtros.page - 1)}
                >
                    ← Anterior
                </button>

                <span className="info">Página {filtros.page}</span>

                <button
                    className="btn"
                    disabled={!datos.next || cargando}
                    onClick={() => cambiarPagina(filtros.page + 1)}
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}

export default Listado;
